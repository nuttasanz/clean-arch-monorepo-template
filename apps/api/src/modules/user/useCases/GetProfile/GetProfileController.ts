import { ApiResponse } from "@shared/utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { GetProfileUseCase } from "./GetProfileUseCase";

@injectable()
export class GetProfileController {
  constructor(
    @inject(GetProfileUseCase)
    private getProfileUseCase: GetProfileUseCase,
  ) {}

  async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = request.user;

      const user = await this.getProfileUseCase.execute(id);

      return response
        .status(200)
        .json(
          ApiResponse.success(
            "User profile retrieved successfully.",
            user.toPublic(),
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
