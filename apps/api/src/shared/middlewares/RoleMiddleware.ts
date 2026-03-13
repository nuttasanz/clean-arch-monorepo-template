import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { UserRole } from "@modules/user/enum/user-role.enum";

export function ensureAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { role } = request.user;

  if (role !== UserRole.ADMIN) {
    throw new AppError("User is not an admin", 403);
  }

  return next();
}
