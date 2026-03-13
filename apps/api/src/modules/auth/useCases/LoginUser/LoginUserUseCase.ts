import { inject, injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "@modules/user/repositories/IUserRepository";
import { LoginUserDTO } from "./LoginUserDTO";
import { AppError } from "@shared/errors/AppError";
import { User } from "@modules/user/domain/User";
import { env } from "@infra/config/env";

interface IResponse {
  user: Omit<User, "password" | "toPublic">;
  token: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ username, password }: LoginUserDTO): Promise<IResponse> {
    const user = await this.userRepository.findByUsernameWithPassword(username);

    if (!user) {
      throw new AppError("Username or password incorrect", 401);
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Username or password incorrect", 401);
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d",
      },
    );

    return {
      user: user.toPublic(),
      token,
    };
  }
}
