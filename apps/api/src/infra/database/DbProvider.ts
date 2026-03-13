import { Pool } from "pg";
import { logger } from "@shared/utils/Logger";

class DbProvider {
  private static pool: Pool;

  public static async getConnection(): Promise<Pool> {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "badminton_nexus",
      });

      // Test connection
      try {
        const client = await this.pool.connect();
        logger.info("Successfully connected to PostgreSQL");
        client.release();
      } catch (err) {
        logger.error({ err }, "Error connecting to PostgreSQL");
        throw err;
      }
    }
    return this.pool;
  }

  public static async query(text: string, params?: unknown[]) {
    const pool = await this.getConnection();
    return pool.query(text, params);
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export { DbProvider };
