import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { DrizzleDb } from './drizzle.types';

export { type DrizzleDb, type TransactionDb } from './drizzle.types';

export const DRIZZLE = Symbol('DRIZZLE');
export const DRIZZLE_SQL = Symbol('DRIZZLE_SQL');

export type DrizzleSql = ReturnType<typeof postgres>;

export const DrizzleSqlProvider: Provider = {
  provide: DRIZZLE_SQL,
  useFactory: (): DrizzleSql => {
    const connectionString = process.env['DATABASE_URL'] as string;
    return postgres(connectionString, { max: 10 });
  },
};

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: (sql: DrizzleSql): DrizzleDb => drizzle(sql, { schema }),
  inject: [DRIZZLE_SQL],
};
