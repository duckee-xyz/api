import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { koaSwagger } from 'koa2-swagger-ui';
import { Config } from '~/config';
import swaggerSpec from '../../generated/openapi/swagger.json';
import { RegisterRoutes } from '../../generated/routes';
import { errorHandler, logger } from './middlewares';

export function createServer(config: Config) {
  const app = new Koa();
  app.use(json());
  app.use(cors());
  app.use(bodyParser());
  app.use(logger(config.env));
  app.use(errorHandler(config.verbose));
  app.use(createRoutes(config));

  return app;
}

export function createRoutes(config: Config): Router.Middleware {
  const router = new Router();
  const startedAt = new Date();
  router.get('/', async (ctx) => {
    ctx.body = {
      message: 'all systems go',
      startedAt: startedAt.toISOString(),
    };
  });
  router.get(
    '/swagger',
    koaSwagger({
      title: 'API Docs',
      hideTopbar: true,
      routePrefix: false,
      exposeSpec: true,
      swaggerVersion: '4.6.2',
      swaggerOptions: {
        spec: swaggerSpec,
        defaultModelRendering: 'schema',
      },
    }),
  );

  RegisterRoutes(router);
  return router.routes();
}
