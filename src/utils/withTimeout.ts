/**
 * Rejects if a promise has not settled in time.
 *
 * Startup gates render nothing until their promise settles, so anything they
 * await needs a ceiling — a hung native call would otherwise leave the app on a
 * blank screen with no way out.
 */
export const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
