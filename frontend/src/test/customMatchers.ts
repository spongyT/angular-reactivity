import { matcherHint, printExpected, printReceived } from "jest-matcher-utils";
import { diff } from "jest-diff";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledOnceWith(...expectedArgs: unknown[]): R;
    }
  }
}

expect.extend({
  toHaveBeenCalledOnceWith(received: jest.Mock, ...expectedArgs: unknown[]) {
    const calls: number = received.mock.calls.length;

    if (calls !== 1) {
      return {
        message: (): string =>
          `${matcherHint(".toHaveBeenCalledOnceWith")}\n\n` +
          `Expected mock function to have been called exactly once, but it was called ${calls} times.`,
        pass: false,
      };
    }

    const pass: boolean = this.equals(received.mock.calls[0], expectedArgs);

    if (pass) {
      return {
        message: (): string =>
          `${matcherHint(".not.toHaveBeenCalledOnceWith")}\n\n` +
          `Expected mock function not to have been called with:\n` +
          `  ${printExpected(expectedArgs)}\n` +
          `But it was called with:\n` +
          `  ${printReceived(received.mock.calls[0])}`,
        pass: true,
      };
    } else {
      return {
        message: (): string =>
          `${matcherHint(".toHaveBeenCalledOnceWith")}\n\n` +
          `Expected mock function to have been called with:\n` +
          `  ${printExpected(expectedArgs)}\n` +
          `But it was called with:\n` +
          `  ${printReceived(received.mock.calls[0])} + ${diff(expectedArgs, received.mock.calls[0])}`,
        pass: false,
      };
    }
  },
});
