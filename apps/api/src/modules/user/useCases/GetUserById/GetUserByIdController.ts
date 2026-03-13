import { inject, injectable } from "tsyringe";
import { GetUserByIdUseCase } from "./GetUserByIdUseCase";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@shared/utils/ApiResponse";
import { z } from "zod";

@injectable()
export class GetUserByIdController {
  constructor(
    @inject(GetUserByIdUseCase)
    private getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const paramsSchema = z.object({
        id: z.uuid("Invalid user ID format."),
      });

      const { id } = paramsSchema.parse(request.params);

      const user = await this.getUserByIdUseCase.execute(id);

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
