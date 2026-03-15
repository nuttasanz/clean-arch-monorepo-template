import { createHash } from 'crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyReply } from 'fastify';
import * as argon2 from 'argon2';
import type { LoginBackendResponse, LoginUserDTO, RefreshBackendResponse, RegisterUserDTO } from '@repo/shared';
import type { DrizzleDb } from '../../infrastructure/database/drizzle.provider';
import { DRIZZLE } from '../../infrastructure/database/drizzle.provider';
import type { Env } from '../../config/env';
import { validateEnv } from '../../config/env';
import { UserRepository } from './user.repository';
import { RefreshTokenRepository } from './refresh-token.repository';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_PATH = '/api/v1/auth';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly env: Env;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {
    this.env = validateEnv();
  }

  async register(dto: RegisterUserDTO): Promise<LoginBackendResponse> {
    const [existingByUsername, existingByEmail] = await Promise.all([
      this.userRepo.findByUsername(this.db, dto.username),
      this.userRepo.findByEmail(this.db, dto.email),
    ]);

    if (existingByUsername) {
      throw new ConflictException('Username is already taken');
    }
    if (existingByEmail) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userRepo.create(this.db, {
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      displayName: dto.displayName ?? null,
      phoneNumber: dto.phoneNumber ?? null,
    });

    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, user: { id: user.id, username: user.username, role: user.role } };
  }

  async login(dto: LoginUserDTO, reply: FastifyReply): Promise<LoginBackendResponse> {
    const user = await this.userRepo.findByUsername(this.db, dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.env.JWT_REFRESH_SECRET,
        expiresIn: this.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.create(this.db, {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    this.setRefreshCookie(reply, refreshToken);

    return { accessToken, user: { id: user.id, username: user.username, role: user.role } };
  }

  async refresh(rawToken: string | undefined, reply: FastifyReply): Promise<RefreshBackendResponse> {
    if (!rawToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(rawToken, {
        secret: this.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    const tokenHash = hashToken(rawToken);
    const storedToken = await this.refreshTokenRepo.findByHash(this.db, tokenHash);
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token revoked or not found');
    }

    const newPayload: JwtPayload = { sub: payload.sub, username: payload.username, role: payload.role };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(newPayload),
      this.jwtService.signAsync(newPayload, {
        secret: this.env.JWT_REFRESH_SECRET,
        expiresIn: this.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.db.transaction(async (tx) => {
      await this.refreshTokenRepo.revoke(tx, tokenHash);
      await this.refreshTokenRepo.create(tx, {
        userId: payload.sub,
        tokenHash: hashToken(newRefreshToken),
        expiresAt,
      });
    });

    this.setRefreshCookie(reply, newRefreshToken);

    return { accessToken: newAccessToken };
  }

  async logout(rawToken: string | undefined, reply: FastifyReply): Promise<void> {
    if (rawToken) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(rawToken, {
          secret: this.env.JWT_REFRESH_SECRET,
        });
        await this.refreshTokenRepo.revokeAllForUser(this.db, payload.sub);
      } catch {
        // Best-effort: revoke by hash even if JWT is expired
        const tokenHash = hashToken(rawToken);
        await this.refreshTokenRepo.revoke(this.db, tokenHash);
      }
    }

    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
  }

  private setRefreshCookie(reply: FastifyReply, token: string): void {
    void reply.setCookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60,
    });
  }
}
