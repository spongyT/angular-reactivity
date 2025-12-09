import { randomUUID } from "node:crypto";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

class JsonStore<T> {
  constructor(private readonly path: string) {}

  async getData(): Promise<T | undefined> {
    if (!(await fileExists(this.path))) {
      return undefined;
    }

    const respText = await readFile(this.path, { encoding: "utf-8" });
    const resp = JSON.parse(respText);
    return resp as T;
  }

  async setData(data: T): Promise<void> {
    return await writeFile(this.path, JSON.stringify(data, undefined, 2), {
      encoding: "utf-8",
    });
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (e) {
    if ((e as any).code === "ENOENT") {
      return false;
    }
    throw e;
  }
}
export const QuestionItemInputZod = z.object({
  text: z.string().min(1),
  options: z
    .array(
      z.object({
        text: z.string(),
        correct: z.boolean(),
      })
    )
    .min(2)
    .max(4)
    .refine(
      (e) => e.filter((f) => f.correct).length === 1,
      "only one item can be marked as correct"
    ),
});

export const QuestionItemZod = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  options: z
    .array(
      z.object({
        text: z.string(),
        id: z.string().uuid(),
        correct: z.boolean(),
      })
    )
    .min(2)
    .max(4)
    .refine(
      (e) => e.filter((f) => f.correct).length === 1,
      "only one item can be marked as correct"
    ),
});
export type QuestionItem = z.infer<typeof QuestionItemZod>;
export const QuestionStoreZod = z.array(QuestionItemZod);

class QuestionStore {
  #jsonStore: JsonStore<QuestionItem[]>;

  constructor(path: string) {
    this.#jsonStore = new JsonStore(path);
  }

  public async getQuestions() {
    return QuestionStoreZod.parse((await this.#jsonStore.getData()) ?? []);
  }

  public async putItem(item: QuestionItem) {
    const allItems = await this.getQuestions();

    const existingItemIdx = allItems.findIndex((e) => e.id === item.id);
    if (existingItemIdx >= 0) {
      allItems[existingItemIdx] = item;
    } else {
      allItems.push(item);
    }

    await this.#jsonStore.setData(allItems);
  }

  public async deleteQuestion(id: string) {
    const allItems = await this.getQuestions();
    const existingItemIdx = allItems.findIndex((e) => e.id === id);
    if (existingItemIdx < 0) {
      return false;
    }
    await this.#jsonStore.setData(allItems.filter((e) => e.id !== id));
    return true;
  }

  public async getQuestion(id: string) {
    return (await this.getQuestions()).find((e) => e.id === id);
  }

  public async populateWithExampleDataIfEmpty(force?: boolean) {
    const allItems = await this.getQuestions();
    if (!force && allItems.length > 0) {
      return;
    }
    const newItems: QuestionItem[] = [
      {
        id: randomUUID(),
        text: "Wann wurde Opitz gegründet?",
        options: ["1980", "1990", "2000"].map((e, i) => ({
          id: randomUUID(),
          text: e,
          correct: i === 1,
        })),
      },
      {
        id: randomUUID(),
        text: "In welchen Ländern hat OC Niederlassungen?",
        options: [
          "Deutschland und Polen",
          "Deutschland und Frankreich",
          "Deutschland",
          "Deutschland, Österreich und Schweiz (DACH)",
        ].map((e, i) => ({
          id: randomUUID(),
          text: e,
          correct: i === 0,
        })),
      },
      {
        id: randomUUID(),
        text: "Wie viele Mitarbeiter sind bei OC angestellt?",
        options: ["100-200", "200-400", "400-600", "600-1000"].map((e, i) => ({
          id: randomUUID(),
          text: e,
          correct: i === 2,
        })),
      },
      {
        id: randomUUID(),
        text: "Wo befindet sich die Zentrale?",
        options: ["Stuttgart", "Berlin", "Nochen", "Freiburg"].map((e, i) => ({
          id: randomUUID(),
          text: e,
          correct: i === 3,
        })),
      },
    ];

    await this.#jsonStore.setData(newItems);
  }
}

const STORE = new QuestionStore(join(process.cwd(), "__questions_store.json"));
export default STORE;
