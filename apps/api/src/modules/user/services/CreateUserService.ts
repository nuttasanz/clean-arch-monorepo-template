import { inject, injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../domain/User";
import { AppError } from "@shared/errors/AppError";
import { UserRole } from "../enum/user-role.enum";

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

@injectable()
export class CreateUserService {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute(data: CreateUserInput): Promise<User> {
    const { username, email, password } = data;

    const usernameExists = await this.userRepository.findByUsername(username);
    if (usernameExists) {
      throw new AppError("Username already exists");
    }

    const emailExists = await this.userRepository.findByEmail(email);
    if (emailExists) {
      throw new AppError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create(
      new User({
        ...data,
        password: hashedPassword,
        role: data.role ?? UserRole.USER,
      }),
    );

    return user;
  }
}
