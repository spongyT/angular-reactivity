import { CatFact } from "../shared/models/cat-fact";

export function fakeCatFact(patch?: Partial<CatFact>): CatFact {
  const id: number = Math.floor(Math.random() * 1000);
  return { fact: `Some fact #${id}`, length: 100 + id, ...patch };
}
