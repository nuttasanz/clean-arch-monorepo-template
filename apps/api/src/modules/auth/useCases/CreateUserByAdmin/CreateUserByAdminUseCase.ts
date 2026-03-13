import { inject, injectable } from "tsyringe";
import { CreateUserByAdminDTO } from "./CreateUserByAdminDTO";
import { User } from "@modules/user/domain/User";
import { CreateUserService } from "@modules/user/services/CreateUserService";
import { UserRole } from "@modules/user/enum/user-role.enum";

@injectable()
export class CreateUserByAdminUseCase {
  constructor(
    @inject(CreateUserService)
    private createUserService: CreateUserService,
  ) {}

  async execute(data: CreateUserByAdminDTO): Promise<User> {
    return this.createUserService.execute({
      ...data,
      role: data.role as UserRole,
    });
  }
}
