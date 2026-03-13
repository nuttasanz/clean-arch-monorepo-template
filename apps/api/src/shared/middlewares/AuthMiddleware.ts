import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { UserRole } from "@modules/user/enum/user-role.enum";
import { env } from "@infra/config/env";

interface IPayload {
  sub: string;
  role: string;
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
    const { sub, role } = jwt.verify(token, env.JWT_SECRET) as IPayload;

    request.user = {
      id: sub,
      role: role as UserRole,
    };

    return next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}
