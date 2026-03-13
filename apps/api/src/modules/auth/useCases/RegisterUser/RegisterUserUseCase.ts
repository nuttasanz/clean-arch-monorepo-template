import { inject, injectable } from "tsyringe";
import { RegisterUserDTO } from "./RegisterUserDTO";
import { User } from "@modules/user/domain/User";
import { CreateUserService } from "@modules/user/services/CreateUserService";
import { UserRole } from "@modules/user/enum/user-role.enum";

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(CreateUserService)
    private createUserService: CreateUserService,
  ) {}

  async execute(data: RegisterUserDTO): Promise<User> {
    return this.createUserService.execute({
      ...data,
      role: UserRole.USER,
    });
  }
}
