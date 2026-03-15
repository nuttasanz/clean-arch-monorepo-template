import type { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from './schema';

export type DrizzleDb = PostgresJsDatabase<typeof schema>;
export type TransactionDb = PostgresJsTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
