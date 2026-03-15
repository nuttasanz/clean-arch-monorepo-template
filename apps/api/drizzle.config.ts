import { defineConfig } from 'drizzle-kit';

// DATABASE_URL is required for commands that connect to the DB (migrate, studio).
// generate and check only read schema files and work without a live connection.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgres://placeholder',
  },
  verbose: true,
  strict: true,
});
