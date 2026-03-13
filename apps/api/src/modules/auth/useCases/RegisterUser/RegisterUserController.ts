import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { RegisterUserUseCase } from "./RegisterUserUseCase";
import { registerUserSchema } from "./RegisterUserDTO";
import { ApiResponse } from "@shared/utils/ApiResponse";

@injectable()
export class RegisterUserController {
  constructor(
    @inject(RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const data = registerUserSchema.parse(request.body);

      const user = await this.registerUserUseCase.execute(data);

      return response
        .status(201)
        .json(
          ApiResponse.success("User registered successfully", user.toPublic()),
        );
    } catch (error) {
      next(error);
    }
  }
}
