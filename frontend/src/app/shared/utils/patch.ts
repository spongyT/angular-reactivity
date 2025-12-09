import { deepCopy } from "./deepCopy";

export const patch = <T extends object>(object: T, update: Partial<T>): T =>
  Object.assign(deepCopy(object), update);
