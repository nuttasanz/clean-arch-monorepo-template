import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import type { AppErrorCode, ApiErrorResponse } from '@repo/shared';

const HTTP_STATUS_TO_CODE: Partial<Record<number, AppErrorCode>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();
    const traceId = request.id as string;

    let status: number;
    let message: string;
    let code: AppErrorCode;
    let details: { field: string; message: string }[] | undefined;

    if (exception instanceof ZodError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = exception.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code =
        HTTP_STATUS_TO_CODE[status] ??
        (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : ((res as Record<string, unknown>)['message'] as string) ??
            exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message =
        process.env['NODE_ENV'] === 'production'
          ? 'An unexpected error occurred'
          : exception instanceof Error
            ? exception.message
            : String(exception);
      this.logger.error({ err: exception, traceId }, 'Unhandled exception');
    }

    const body: ApiErrorResponse = {
      error: { message, code, ...(details && { details }) },
      meta: { traceId },
    };

    void reply.header('X-Trace-Id', traceId).status(status).send(body);
  }
}
