import { User } from "../domain/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findByUsername(username: string): Promise<User | undefined>;
  findByUsernameWithPassword(username: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
}
