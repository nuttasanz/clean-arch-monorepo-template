import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { UserRole } from "@modules/user/enum/user-role.enum";

interface IPayload {
  sub: string;
  role: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token missing", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub, role } = jwt.verify(token, getJwtSecret()) as IPayload;

    request.user = {
      id: sub,
      role: role as UserRole,
    };

    return next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}
