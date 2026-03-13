import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { CreateUserByAdminUseCase } from "./CreateUserByAdminUseCase";
import { createUserByAdminSchema } from "./CreateUserByAdminDTO";
import { ApiResponse } from "@shared/utils/ApiResponse";

@injectable()
export class CreateUserByAdminController {
  constructor(
    @inject(CreateUserByAdminUseCase)
    private createUserByAdminUseCase: CreateUserByAdminUseCase,
  ) {}

  async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const data = createUserByAdminSchema.parse(request.body);

      const user = await this.createUserByAdminUseCase.execute(data);

      return response
        .status(201)
        .json(
          ApiResponse.success(
            "User created by admin successfully",
            user.toPublic(),
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
