import { injectable } from "tsyringe";
import { DbProvider } from "@infra/database/DbProvider";
import { UserRole } from "../enum/user-role.enum";
import { User } from "../domain/User";
import { IUserRepository } from "./IUserRepository";
/** Explicit column list excluding password for safe queries */
const SAFE_COLUMNS = `
  id, first_name, last_name, display_name, username, email,
  phone_number, elo_rating, penalty_points, role, created_at, updated_at
`;

/** All columns including password (for auth flows only) */
const ALL_COLUMNS = `${SAFE_COLUMNS}, password`;

interface UserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  username: string;
  email: string;
  phone_number: string | null;
  password?: string;
  elo_rating: number;
  penalty_points: number;
  role: string;
  created_at: Date;
  updated_at: Date;
}

@injectable()
export class SqlUserRepository implements IUserRepository {
  private mapRowToUser(row: UserRow): User {
    return new User(
      {
        firstName: row.first_name ?? undefined,
        lastName: row.last_name ?? undefined,
        displayName: row.display_name ?? undefined,
        username: row.username,
        email: row.email,
        phoneNumber: row.phone_number ?? undefined,
        password: row.password ?? "",
        eloRating: row.elo_rating,
        penaltyPoints: row.penalty_points,
        role: row.role as UserRole,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      row.id,
    );
  }

  async create(user: User): Promise<User> {
    const {
      firstName,
      lastName,
      displayName,
      username,
      email,
      phoneNumber,
      password,
      eloRating,
      penaltyPoints,
      role,
    } = user;

    const result = await DbProvider.query(
      `INSERT INTO users (
        first_name, last_name, display_name, username, email, 
        phone_number, password, elo_rating, penalty_points, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING ${SAFE_COLUMNS}`,
      [
        firstName,
        lastName,
        displayName,
        username,
        email,
        phoneNumber,
        password,
        eloRating,
        penaltyPoints,
        role,
      ],
    );

    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await DbProvider.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const result = await DbProvider.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByUsernameWithPassword(
    username: string,
  ): Promise<User | undefined> {
    const result = await DbProvider.query(
      `SELECT ${ALL_COLUMNS} FROM users WHERE username = $1`,
      [username],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await DbProvider.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToUser(result.rows[0]);
  }
}
