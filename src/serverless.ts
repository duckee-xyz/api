import { log } from 'pine-log';
import 'reflect-metadata';
import serverless from 'serverless-http';
import { Container } from 'typedi';
import { createServer } from './api';
import { GenerateInBackground } from './generation';
import { initializeDependency } from './initializeDependency';
import { sleep } from './utils';

let serverlessHandler: serverless.Handler | null = null;

async function initializeOnce(): Promise<serverless.Handler> {
  if (!serverlessHandler) {
    const { config } = await initializeDependency();
    serverlessHandler = serverless(createServer(config.env));
  }
  return serverlessHandler;
}

export const handler: serverless.Handler = async (event, context) => {
  const handler = await initializeOnce();
  return await handler(event, context);
};

export const asyncTaskHandler: serverless.Handler = async (event, context): Promise<Object> => {
  log.trace('invoked lambda ', event);
  try {
    await initializeOnce();
    const { type, payload } = event as any;
    switch (type) {
      case 'generate':
        await Container.get(GenerateInBackground).handleLambda(payload);
        break;
    }
  } catch (err) {
    log.error(`unable to invoke: ${(err as Error).stack ?? (err as Error).message ?? err}`);
  }
  log.trace('done');
  await sleep(500);
  return {};
};
