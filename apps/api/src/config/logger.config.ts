import type { FastifyServerOptions } from 'fastify';
import type { Env } from './env';

export function buildPinoOptions(env: Env): FastifyServerOptions['logger'] {
  return {
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV !== 'production' && {
      transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } },
    }),
    serializers: {
      req: (req: { id: unknown; method: string; url: string }) => ({
        traceId: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
  };
}
