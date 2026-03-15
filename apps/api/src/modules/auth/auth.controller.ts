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

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_PATH = '/api/v1/auth';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(reply: FastifyReply, token: string): void {
    void reply.setCookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) reply: FastifyReply,
  ): Promise<void> {
    const dto = registerUserSchema.parse(req.body);
    const result = await this.authService.register(dto);
    this.setRefreshCookie(reply, result.refreshToken);
    const response: ApiSuccessResponse<LoginBackendResponse> = {
      data: { accessToken: result.accessToken, user: result.user },
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
    const result = await this.authService.login(dto);
    this.setRefreshCookie(reply, result.refreshToken);
    const response: ApiSuccessResponse<LoginBackendResponse> = {
      data: { accessToken: result.accessToken, user: result.user },
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
    const rawToken = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    const result = await this.authService.refresh(rawToken);
    this.setRefreshCookie(reply, result.refreshToken);
    const response: ApiSuccessResponse<RefreshBackendResponse> = {
      data: { accessToken: result.accessToken },
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
    const rawToken = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    await this.authService.logout(rawToken);
    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    await reply.status(HttpStatus.NO_CONTENT).send();
  }
}
