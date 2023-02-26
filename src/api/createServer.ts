import cors from '@koa/cors';
import multer from '@koa/multer';
import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { koaSwagger } from 'koa2-swagger-ui';
import swaggerSpec from '../../generated/openapi/swagger.json';
import { RegisterRoutes } from '../../generated/routes';
import { auth } from './auth';
import { errorHandler, logger } from './middlewares';

export function createServer(env: string) {
  const app = new Koa();
  app.use(auth());
  app.use(json());
  app.use(cors());
  app.use(bodyParser());
  app.use(multer().any());
  app.use(async (ctx, next) => {
    if (ctx.request.body instanceof Buffer) {
      try {
        ctx.request.body = JSON.parse(ctx.request.rawBody);
      } catch (ignored) {}
    }
    await next();
  });
  app.use(logger(env));
  app.use(errorHandler(true));
  app.use(createRoutes());

  return app;
}

export function createRoutes(): Router.Middleware {
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
        persistAuthorization: true,
      },
    }),
  );

  RegisterRoutes(router);
  return router.routes();
}
