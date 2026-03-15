import { Provider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');
export const DRIZZLE_SQL = Symbol('DRIZZLE_SQL');

export type DrizzleDb = PostgresJsDatabase<typeof schema>;
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
