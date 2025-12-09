import { patch } from "@app/shared/utils/patch";

export const builder =
  <T extends object>(source: T) =>
  (update: Partial<T> = {}) =>
    patch(source, update) as T;
