import { randomUUID } from "node:crypto";
import z from "zod";
import STORE from "./state.js";
import EventEmitter from "node:events";

const PlayerZod = z.object({
  name: z.string().max(32),
  id: z.string().uuid(),
  token: z.string(),
  score: z.number().nonnegative().int(),
});

const PlayerPublicZod = PlayerZod.omit({ token: true });

const GameStateLobbyZod = z.object({
  state: z.literal("lobby"),
  players: z.record(PlayerZod),
  rounds: z.number().int().nonnegative(),
  timeForQuestionSeconds: z.number().int().nonnegative(),
});

const GameStateLobbyPublicZod = z.object({
  state: z.literal("lobby"),
  players: z.record(PlayerPublicZod),
  rounds: z.number().int().positive(),
  timeForQuestionSeconds: z.number().int().nonnegative(),
});

const GameStateWaitingForAnswersZod = z.object({
  state: z.literal("waitingForAnswers"),
  players: z.record(PlayerZod.extend({ answer: z.string().uuid().optional() })),
  question: z.object({
    text: z.string(),
    id: z.string().uuid(),
  }),
  options: z.array(
    z.object({
      text: z.string(),
      id: z.string().uuid(),
      correct: z.boolean(),
    })
  ),
  currentRound: z.number().positive().int(),
  rounds: z.number().int().nonnegative(),
  startedAtUnix: z.number().int().nonnegative(),
  deadlineUnix: z.number().int().nonnegative(),
});

const GameStateWaitingForAnswersPublicZod = z.object({
  state: z.literal("waitingForAnswers"),
  players: z.record(PlayerPublicZod.extend({ hasAnswered: z.boolean() })),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      id: z.string().uuid(),
    })
  ),
  currentRound: z.number().positive().int(),
  rounds: z.number().int().nonnegative(),
  startedAtUnix: z.number().int().nonnegative(),
  deadlineUnix: z.number().int().nonnegative(),
});

const GameStatePostAnswersZod = z.object({
  state: z.literal("postAnswer"),
  players: z.record(PlayerZod),
  question: z.object({
    text: z.string(),
    id: z.string().uuid(),
  }),
  options: z.array(
    z.object({
      text: z.string(),
      id: z.string().uuid(),
      selectedByPlayerID: z.array(z.string()),
      correct: z.boolean(),
    })
  ),
  currentRound: z.number().positive().int(),
  rounds: z.number().int().nonnegative(),
});

const GameStatePostAnswersPublicZod = z.object({
  state: z.literal("postAnswer"),
  players: z.record(PlayerPublicZod),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      id: z.string().uuid(),
      selectedByPlayerID: z.array(z.string()),
      correct: z.boolean(),
    })
  ),
});

const GameStateZod = z.union([
  GameStateLobbyZod,
  GameStateWaitingForAnswersZod,
  GameStatePostAnswersZod,
]);

const GameStateZodPublic = z.union([
  GameStateLobbyPublicZod,
  GameStateWaitingForAnswersPublicZod,
  GameStatePostAnswersPublicZod,
]);

type GameState = z.infer<typeof GameStateZod>;

function asPublic(state: GameState): z.infer<typeof GameStateZodPublic> {
  if (state.state === "lobby") {
    const resp: z.infer<typeof GameStateLobbyPublicZod> = {
      state: "lobby",
      players: Object.fromEntries(
        Object.values(state.players).map((e) => [
          e.id,
          {
            name: e.name,
            score: e.score,
            id: e.id,
          },
        ])
      ),
      rounds: state.rounds,
      timeForQuestionSeconds: state.timeForQuestionSeconds,
    };
    return resp;
  } else if (state.state === "waitingForAnswers") {
    const resp: z.infer<typeof GameStateWaitingForAnswersPublicZod> = {
      state: "waitingForAnswers",
      options: state.options.map((e) => ({
        id: e.id,
        text: e.text,
      })),
      question: state.question.text,
      players: Object.fromEntries(
        Object.values(state.players).map((e) => [
          e.id,
          {
            name: e.name,
            score: e.score,
            id: e.id,
            hasAnswered: !!e.answer,
          },
        ])
      ),
      currentRound: state.currentRound,
      rounds: state.rounds,
      startedAtUnix: state.startedAtUnix,
      deadlineUnix: state.deadlineUnix,
    };
    return resp;
  } else if (state.state === "postAnswer") {
    const resp: z.infer<typeof GameStatePostAnswersPublicZod> = {
      state: "postAnswer",
      options: state.options,
      question: state.question.text,
      players: Object.fromEntries(
        Object.values(state.players).map((e) => [
          e.id,
          {
            name: e.name,
            score: e.score,
            id: e.id,
          },
        ])
      ),
    };
    return resp;
  } else {
    throw new Error("uncovered branch");
  }
}

export class GameSession {
  #state: GameState;
  #tokenToPlayerID: Record<string, string> = {};
  public emitter: EventEmitter = new EventEmitter();
  #timeout: NodeJS.Timeout | undefined;
  readonly id = randomUUID();

  constructor(
    private readonly totalRounds: number,
    private readonly timeForQuestionSeconds: number
  ) {
    this.#state = {
      state: "lobby",
      players: {},
      timeForQuestionSeconds: timeForQuestionSeconds,
      rounds: totalRounds,
    };
  }

  addPlayer(player: z.infer<typeof PlayerZod>) {
    if (Object.keys(this.#state.players).length >= 20) {
      throw new Error("too many players");
    }

    player = PlayerZod.parse(player);
    this.#state.players[player.id] = player;
    this.#tokenToPlayerID[player.token] = player.id;
    this.#notifyUpdate();
  }
  removePlayer(id: string) {
    if (this.#state.players[id]) {
      delete this.#state.players[id];
      this.#notifyUpdate();
      return true;
    }
    return false;
  }

  leavePlayer(token: string) {
    if (this.#tokenToPlayerID[token]) {
      delete this.#state.players[this.#tokenToPlayerID[token]];
      delete this.#tokenToPlayerID[token];
      this.#notifyUpdate();
      return true;
    }
    return false;
  }

  async startGame() {
    if (this.#state.state !== "lobby") {
      throw new Error("Cannot start game that is already started");
    }
    if (Object.values(this.#state.players).length === 0) {
      throw new Error("cannot start. Need at least oen player to start");
    }
    Object.keys(this.#state.players).forEach(
      (e) => (this.#state.players[e].score = 0)
    );
    await this.#askNextQuestion();
  }

  async postAnswer(playerToken: string, id: string) {
    if (this.#state.state !== "waitingForAnswers") {
      throw new Error("game is currently not accepting answers");
    }
    const playerID = this.#tokenToPlayerID[playerToken];
    if (!playerID) {
      throw new Error("token was rejected");
    }
    const answer = this.#state.options.find((e) => e.id === id);
    if (!answer) {
      throw new Error("no answer found with provided ID");
    }
    this.#state.players[playerID].answer = answer.id;
    // Check if everyone has answered
    const hasMissingAnswers = Object.values(this.#state.players).some(
      (e) => !e.answer
    );
    if (!hasMissingAnswers) {
      await this.#goToPostAnswer();
    } else {
      this.#notifyUpdate();
    }
  }

  async #goToPostAnswer() {
    if (this.#state.state !== "waitingForAnswers") {
      throw new Error(
        "must be in waitingForAnswers state to move to question resolution"
      );
    }
    const state = GameStateWaitingForAnswersZod.parse(this.#state);
    this.#state = {
      state: "postAnswer",
      question: this.#state.question,
      options: this.#state.options.map((e) => ({
        ...e,
        selectedByPlayerID: Object.values(state.players)
          .filter((p) => p.answer === e.id)
          .map((e) => e.id),
      })),
      // The re-parse here happens to remove the submitted answer so its not present in the next question
      players: z.record(PlayerZod).parse(state.players),
      currentRound: this.#state.currentRound,
      rounds: this.#state.rounds,
    };

    // add a point to everyone that got it right
    const correctID = state.options.find((e) => e.correct)!.id;
    Object.values(state.players)
      .filter((p) => p.answer === correctID)
      .map((e) => e.id)
      .forEach((e) => this.#state.players[e].score++);

    if (this.#timeout !== undefined) {
      clearTimeout(this.#timeout);
      this.#timeout = setTimeout(() => {
        this.#askNextQuestion();
      }, 5_000);
    }
    this.#notifyUpdate();
  }

  async #askNextQuestion() {
    let previousQuestionID: string | undefined;
    if (this.#state.state === "postAnswer") {
      previousQuestionID = this.#state.question.id;
      if (this.#state.currentRound + 1 >= this.#state.rounds) {
        // last round
        this.#state = {
          state: "lobby",
          timeForQuestionSeconds: this.timeForQuestionSeconds,
          rounds: this.totalRounds,
          players: z.record(PlayerZod).parse(this.#state.players),
        };
        this.#notifyUpdate();
        return;
      }
    }
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }
    this.#timeout = setTimeout(async () => {
      await this.#goToPostAnswer();
    }, this.timeForQuestionSeconds * 1000);
    const nextQuestion =
      (await STORE.getQuestions())
        .filter((e) => e.id !== previousQuestionID)
        .sort(() => Math.random() - 0.5)
        .find(() => true) ??
      (await STORE.getQuestion(previousQuestionID ?? randomUUID()));
    if (!nextQuestion) {
      // cannot continue because no questions. edge case - abort game
      this.#state = {
        state: "lobby",
        rounds: this.totalRounds,
        players: this.#state.players,
        timeForQuestionSeconds: this.timeForQuestionSeconds,
      };
      this.#notifyUpdate();
      return;
    }
    this.#state = {
      state: "waitingForAnswers",
      currentRound:
        this.#state.state == "lobby" ? 1 : this.#state.currentRound + 1,
      rounds: this.#state.rounds,
      players: this.#state.players,
      options: nextQuestion.options,
      question: { id: nextQuestion.id, text: nextQuestion.text },
      startedAtUnix: Number(new Date()),
      deadlineUnix: Number(new Date()) + this.timeForQuestionSeconds * 1_000,
    };
    this.#notifyUpdate();
  }

  #notifyUpdate() {
    this.emitter.emit("event", this.publicState);
  }

  notifyDestroy() {
    this.emitter.emit("event", { state: "destroyed" });
    this.emitter.removeAllListeners("event");
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }
  }

  get publicState() {
    return { ...asPublic(this.#state), id: this.id };
  }
}
