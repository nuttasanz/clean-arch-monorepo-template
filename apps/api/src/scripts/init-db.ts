import fs from "fs";
import path from "path";
import { DbProvider } from "../infra/database/DbProvider";

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, "../infra/database/schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Initializing database schema...");
    await DbProvider.query(sql);
    console.log("Database schema initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
}

initDb();
