import express from "express";
import STORE, { QuestionItemInputZod, QuestionItemZod } from "./state.js";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { GameSession } from "./game.js";
import { z } from "zod";
const port = Number(process.env["PORT"] ?? 8080);

const app = express();
app.use(express.json());
app.use(cors());

await STORE.populateWithExampleDataIfEmpty();

const SESSIONS: Record<string, GameSession> = {};

app.get("/questions", async (req, res) => {
  const data = await STORE.getQuestions();
  res.json(data);
});

app.post("/questions/reset", async (req, res) => {
  const data = await STORE.populateWithExampleDataIfEmpty(true);
  res.json(data);
});

app.delete("/questions/:id", async (req, res) => {
  const data = await STORE.deleteQuestion(req.params.id);
  res.json({ deleted: data });
});

app.get("/questions/:id", async (req, res) => {
  const data = await STORE.getQuestion(req.params.id);
  if (!data) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(data);
});

app.post("/questions", async (req, res) => {
  const payload = QuestionItemInputZod.safeParse(req.body);
  if (!payload.success) {
    res.status(400).json({
      message: "Failed to parse request payload",
      error: payload.error,
    });
    return;
  }
  const item = {
    ...payload.data,
    id: randomUUID(),
    options: payload.data.options.map((e) => ({ ...e, id: randomUUID() })),
  };
  await STORE.putItem(item);

  res.status(201).json(item);
});

app.get("/games", async (req, res) => {
  const response = Object.values(SESSIONS).map((e) => e.publicState);
  res.json(response);
});

app.get("/games/:id", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  res.json(game.publicState);
});

app.delete("/games/:id", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (game) {
    game.notifyDestroy();
    delete SESSIONS[req.params.id];
  }
  res.json({});
});

app.post("/games/:id/join", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  const payload = z
    .object({ name: z.string().min(1).max(32) })
    .safeParse(req.body);
  if (!payload.success) {
    res.status(400).json({
      message: "Failed to parse request payload",
      error: payload.error,
    });
    return;
  }

  const player = {
    id: randomUUID(),
    name: payload.data.name,
    score: 0,
    token: randomUUID(),
  };
  try {
    game.addPlayer(player);
  } catch (e) {
    res.status(400).json({
      message: "Failed to add player",
      error: e + "",
    });
    return;
  }
  res.status(201).json(player);
});

app.post("/games/:id/leave", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  const authHeader = req.headers["authorization"];

  if (
    !authHeader ||
    authHeader.split(" ").length != 2 ||
    authHeader.split(" ")[0] !== "Bearer"
  ) {
    res.status(401).json({
      error:
        "Authorization header missing. When joining a game, use the token and set it as Bearer Token. E.g. 'Authorization: Bearer *************'",
    });
    return;
  }
  const token = authHeader.split(" ")[1];

  res.json({ left: game.leavePlayer(token) });
});

app.post("/games/:id/start", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  try {
    await game.startGame();
  } catch (err) {
    res.status(400).json({
      message: "Failed to start game",
    });
    return;
  }
  res.json(game.publicState);
});

app.post("/games/:id/submitAnswer", async (req, res) => {
  const authHeader = req.headers["authorization"];

  if (
    !authHeader ||
    authHeader.split(" ").length != 2 ||
    authHeader.split(" ")[0] !== "Bearer"
  ) {
    res.status(401).json({
      error:
        "Authorization header missing. When joining a game, use the token and set it as Bearer Token. E.g. 'Authorization: Bearer *************'",
    });
    return;
  }
  const token = authHeader.split(" ")[1];

  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  const payload = z
    .object({ selectedOptionId: z.string().uuid() })
    .safeParse(req.body);
  if (!payload.success) {
    res.status(400).json({
      message: "Failed to parse request payload",
      error: payload.error,
    });
    return;
  }

  try {
    game.postAnswer(token, payload.data.selectedOptionId);
  } catch (err) {
    res.status(400).json({
      message: "Failed to post answer",
      error: err + "",
    });
    return;
  }
  res.json(game.publicState);
});

app.get("/games/:id/sse", async (req, res) => {
  const game = SESSIONS[req.params.id];
  if (!game) {
    res.status(404).json({
      message: "Game not found",
    });
    return;
  }
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  res.write("retry: 10000\n\n");
  res.write(`data: ${JSON.stringify(game.publicState)}\n\n`);

  const listenerFn = (data: any) => {
    const payload = JSON.stringify(data);
    res.write(`data: ${payload}\n\n`);
  };
  game.emitter.addListener("event", listenerFn);
  console.log("sub'd listener for game " + game.id);

  req.on("close", () => {
    game.emitter.removeListener("event", listenerFn);
    console.log("unsub'd listener for game " + game.id);
  });
});

app.post("/games", async (req, res) => {
  const payload = z
    .object({
      timeToAnswerSeconds: z.number().int().positive().max(120),
      questions: z.number().int().max(20),
    })
    .safeParse(req.body);
  if (!payload.success) {
    res.status(400).json({
      message: "Failed to parse request payload",
      error: payload.error,
    });
    return;
  }

  const game = new GameSession(
    payload.data.questions,
    payload.data.timeToAnswerSeconds
  );
  SESSIONS[game.id] = game;

  res.status(201).json(game.publicState);
});

app.listen(port, () => {
  console.log(":" + port);
});
