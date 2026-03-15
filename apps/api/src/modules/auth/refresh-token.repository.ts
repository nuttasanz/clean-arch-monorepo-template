import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { DrizzleDb, TransactionDb } from '../../infrastructure/database/drizzle.provider';
import {
  refreshTokens,
  type NewRefreshToken,
  type RefreshToken,
} from '../../infrastructure/database/schema';

@Injectable()
export class RefreshTokenRepository {
  async create(
    db: DrizzleDb | TransactionDb,
    data: NewRefreshToken,
  ): Promise<RefreshToken> {
    const result = await db.insert(refreshTokens).values(data).returning();
    return result[0]!;
  }

  async findByHash(
    db: DrizzleDb | TransactionDb,
    tokenHash: string,
  ): Promise<RefreshToken | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
      .limit(1);
    return result[0];
  }

  async revoke(db: DrizzleDb | TransactionDb, tokenHash: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllForUser(db: DrizzleDb | TransactionDb, userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }
}
