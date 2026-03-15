import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDb, TransactionDb } from '../../infrastructure/database/drizzle.provider';
import { users, type NewUser, type User } from '../../infrastructure/database/schema';

@Injectable()
export class UserRepository {
  async findByUsername(db: DrizzleDb | TransactionDb, username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async findByEmail(db: DrizzleDb | TransactionDb, email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async findById(db: DrizzleDb | TransactionDb, id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async create(db: DrizzleDb | TransactionDb, data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0]!;
  }
}
