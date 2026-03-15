import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { registerUserSchema, loginUserSchema } from '@repo/shared';
import type { ApiSuccessResponse, LoginBackendResponse, RefreshBackendResponse } from '@repo/shared';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) reply: FastifyReply,
  ): Promise<void> {
    const dto = registerUserSchema.parse(req.body);
    const result = await this.authService.register(dto);
    const response: ApiSuccessResponse<LoginBackendResponse> = {
      data: result,
      meta: { traceId: req.id as string },
    };
    await reply.status(HttpStatus.CREATED).send(response);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) reply: FastifyReply,
  ): Promise<void> {
    const dto = loginUserSchema.parse(req.body);
    const result = await this.authService.login(dto, reply);
    const response: ApiSuccessResponse<LoginBackendResponse> = {
      data: result,
      meta: { traceId: req.id as string },
    };
    await reply.status(HttpStatus.OK).send(response);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) reply: FastifyReply,
  ): Promise<void> {
    const rawToken = (req.cookies as Record<string, string | undefined>)['refreshToken'];
    const result = await this.authService.refresh(rawToken, reply);
    const response: ApiSuccessResponse<RefreshBackendResponse> = {
      data: result,
      meta: { traceId: req.id as string },
    };
    await reply.status(HttpStatus.OK).send(response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) reply: FastifyReply,
  ): Promise<void> {
    const rawToken = (req.cookies as Record<string, string | undefined>)['refreshToken'];
    await this.authService.logout(rawToken, reply);
    await reply.status(HttpStatus.NO_CONTENT).send();
  }
}
