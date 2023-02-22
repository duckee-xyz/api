/**
 * Unlike [Object.assign] does override `null` and `undefined` values,
 * this method doesn't override nullish values.
 *x
 * @param target (e.g. a default option object)
 * @param sources (e.g. an user-given options)
 */
export const assignWithoutNull = <T extends object, U>(target: T, ...sources: U[]): T & U =>
  Object.assign(target, ...sources.filter((src) => typeof src === 'object').map((src) => clearNullish(src)));

export const tryOrNull = <T>(fn: () => T): T | undefined => {
  try {
    return fn();
  } catch (_) {}
};

export const tryAwaitOrNull = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (_) {}
};

export const clearNullish = (o: any) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && !Number.isNaN(v)));

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
