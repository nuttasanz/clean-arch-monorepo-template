import 'reflect-metadata';
import { randomUUID } from 'crypto';
import type { IncomingMessage } from 'http';
import type { Http2ServerRequest } from 'http2';
import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { validateEnv } from './config/env';
import { buildPinoOptions } from './config/logger.config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap(): Promise<void> {
  const env = validateEnv();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      genReqId: (req: IncomingMessage | Http2ServerRequest) =>
        (req.headers['x-request-id'] as string) || randomUUID(),
      logger: buildPinoOptions(env),
    }),
    { bufferLogs: true },
  );

  await app.register(fastifyCookie);
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();
  await app.listen(env.PORT, '0.0.0.0');
}

void bootstrap();
