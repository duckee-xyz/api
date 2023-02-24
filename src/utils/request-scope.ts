import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export async function openRequestScope<T>(fn: () => Promise<T>) {
  await asyncLocalStorage.run(new Map(), fn);
}

export function useRequestScope(): Map<string, any> | undefined {
  return asyncLocalStorage.getStore() as Map<string, any>;
}
