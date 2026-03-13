import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { logger } from "../utils/Logger";

export function errorHandler(
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json(ApiResponse.error(err.message));
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return response
      .status(400)
      .json(ApiResponse.error("Validation failed", errors));
  }

  logger.error(
    { err, path: request.path, method: request.method },
    "Unhandled error",
  );

  return response.status(500).json(ApiResponse.error("Internal server error"));
}
