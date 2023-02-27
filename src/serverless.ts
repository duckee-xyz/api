import 'reflect-metadata';
import serverless from 'serverless-http';
import { createServer } from './api';
import { initializeDependency } from './initializeDependency';

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
