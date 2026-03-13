import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { LoginUserUseCase } from "./LoginUserUseCase";
import { loginUserSchema } from "./LoginUserDTO";
import { ApiResponse } from "@shared/utils/ApiResponse";

@injectable()
export class LoginUserController {
  constructor(
    @inject(LoginUserUseCase)
    private loginUserUseCase: LoginUserUseCase,
  ) {}

  async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const data = loginUserSchema.parse(request.body);

      const result = await this.loginUserUseCase.execute(data);

      return response.json(ApiResponse.success("Login successful", result));
    } catch (error) {
      next(error);
    }
  }
}
