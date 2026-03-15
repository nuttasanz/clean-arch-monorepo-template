import { createHash } from 'crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { LoginUserDTO, RegisterUserDTO, UserRole } from '@repo/shared';
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

export interface LoginServiceResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; username: string; role: UserRole };
}

export interface RefreshServiceResult {
  accessToken: string;
  refreshToken: string;
}

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

  async register(dto: RegisterUserDTO): Promise<LoginServiceResult> {
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

    return { accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } };
  }

  async login(dto: LoginUserDTO): Promise<LoginServiceResult> {
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

    return { accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } };
  }

  async refresh(rawToken: string | undefined): Promise<RefreshServiceResult> {
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

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(rawToken: string | undefined): Promise<void> {
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
  }
}
