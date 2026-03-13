import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { DbProvider } from "../infra/database/DbProvider";

dotenv.config({ path: [".env.development.local", ".env"] });

async function seedAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME || "adminfreud";
    const email = process.env.ADMIN_EMAIL || "adminfreud@test.com";
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error(
        "ADMIN_PASSWORD environment variable is required. Set it in .env file.",
      );
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Seeding admin user...");

    await DbProvider.query(
      `INSERT INTO users (first_name, last_name, display_name, username, email, password, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (username) DO NOTHING`,
      ["System", "Admin", "Admin", username, email, hashedPassword, "ADMIN"],
    );

    console.log("Admin user seeded successfully (if not already exists).");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin user:", err);
    process.exit(1);
  }
}

seedAdmin();
