import cors from '@koa/cors';
import Router from '@koa/router';
import Koa, { Middleware } from 'koa';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { koaSwagger } from 'koa2-swagger-ui';
import { log } from 'pine-log';
import { Config } from '~/config';
import { errorHandler, logger } from './middlewares';

export async function createServer(config: Config) {
  const app = new Koa();
  app.use(json());
  app.use(cors());
  app.use(bodyParser());
  app.use(logger(config.env));
  app.use(errorHandler(config.verbose));
  app.use(await createRoutes(config));

  return app;
}

export async function createRoutes(config: Config): Promise<Router.Middleware> {
  const { RegisterRoutes } = await importTsoaGeneratedModule('../../generated/routes');

  const router = new Router();
  const startedAt = new Date();
  router.get('/', async (ctx) => {
    ctx.body = {
      message: 'all systems go',
      startedAt: startedAt.toISOString(),
    };
  });
  router.get('/swagger', await serveSwagger());

  RegisterRoutes(router);
  return router.routes();
}

export const serveSwagger = async (): Promise<Middleware> =>
  koaSwagger({
    title: 'API Docs',
    hideTopbar: true,
    routePrefix: false,
    exposeSpec: true,
    swaggerOptions: {
      spec: await importTsoaGeneratedModule('../../generated/openapi/swagger.json'),
      defaultModelRendering: 'schema',
    },
  });

const importTsoaGeneratedModule = async (path: string): Promise<any> => {
  try {
    return await import(path);
  } catch (err) {
    log.error(`failed to import ${path}`, err as Error);
    throw new Error(
      `Generated code (importing ${path}) not found. you should run "yarn generate" before running the server!`,
    );
  }
};
