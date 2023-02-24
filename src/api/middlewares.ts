import { ValidateError as TsoaValidateError } from '@tsoa/runtime/dist/routeGeneration/templateHelpers';
import { Middleware } from 'koa';
import { log } from 'pine-log';
import { Env } from '~/config';
import { ErrorWithHttpStatus } from '~/errors';
import { assignWithoutNull, clearNullish } from '~/utils';

/**
 * logs request.
 * @param env
 */
export function logger(env: Env): Middleware {
  return async (ctx, next) => {
    const startAt = Date.now();
    await next();

    if (isLogIgnoredURL(ctx.url) || ctx.headers['X-E2E-Test']) {
      return;
    }
    const attrs = clearNullish({
      tag: 'API',
      method: ctx.method,
      url: ctx.url,
      status: ctx.response.status,
      elapsedMs: Date.now() - startAt,
      // user: (ctx.request as AuthRequest).user?.id,
    });
    if (ctx.status >= 200 && ctx.status < 300) {
      log.info('HTTP request', attrs);
    } else {
      const { code: errCode, message: errMsg } = ctx.body.error;
      if (errCode === ERROR_CODE_NOT_FOUND) {
        return;
      }
      log.error('HTTP request', clearNullish({ ...attrs, errCode, errMsg }));
    }
  };
}

const IGNORE_LOG = ['/healthz', '/favicon', '/objekt/v1/token/'];

const isLogIgnoredURL = (url: string): boolean => {
  if (url === '/') {
    return true;
  }
  for (const ignored of IGNORE_LOG) {
    if (url.startsWith(ignored)) {
      return true;
    }
  }
  return false;
};

const ERROR_CODE_NOT_FOUND = 'NotFound';

/**
 * catches all error and renders a standardized error response with corresponding HTTP status code.
 * @param verbose will add `error.stack` field if `true`
 */
export function errorHandler(verbose: boolean): Middleware {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.status === 404) {
        ctx.body = { error: { code: ERROR_CODE_NOT_FOUND, message: 'route not found' } };
        ctx.status = 404;
      }
    } catch (err) {
      const { status, body } = buildErrorResponse(err as Error, verbose);
      ctx.body = body;
      ctx.status = status;
    }
  };
}

export function buildErrorResponse(err: Error, verbose: boolean): { status: number; body: object } {
  const httpErr = err as ErrorWithHttpStatus;
  const code = httpErr.code ?? err.constructor.name;
  const message = httpErr.message ?? err.message;
  const stack = err.stack ? prettifyStack(err.stack) : undefined;

  if (err instanceof TsoaValidateError) {
    return {
      status: 400,
      body: {
        error: {
          message,
          validation: err.fields,
        },
      },
    };
  }
  return {
    status: httpErr.status ?? 500,
    body: {
      error: assignWithoutNull({
        code,
        message,
        ...httpErr.payload,
        stack: verbose ? stack : null,
      }),
    },
  };
}

const prettifyStack = (stack: string) =>
  stack
    .split('\n')
    .map((line) => line.replace('at', '').trim())
    .map((line) => line.replace(process.cwd(), '.'))
    .filter((line) => line.includes('processTicksAndRejections (node:internal/process'))
    .slice(1);
