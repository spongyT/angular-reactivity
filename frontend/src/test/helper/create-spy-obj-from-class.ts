type Class<T> = new (...args: never[]) => T;

export function createSpyObjFromClass<T extends object>(
  x: Class<T>,
): jest.Mocked<T> {
  return Object.getOwnPropertyNames(x.prototype).reduce(
    (target: object, property: string) => {
      // @ts-ignore
      target[property] = jest.fn();
      return target;
    },
    {},
  ) as jest.Mocked<T>;
}
