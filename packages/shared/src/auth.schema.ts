import { z } from "zod";
import { UserRole } from "./enums/user-role.enum";

/** Represents the authenticated user object returned to the client (token lives in HttpOnly cookie). */
export const authUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.nativeEnum(UserRole),
});

/** Shape of the BFF login response (token is never sent to client JS). */
export const loginClientResponseSchema = z.object({
  user: authUserSchema,
});

/** Shape of the BFF register response. */
export const registerClientResponseSchema = z.object({
  message: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginClientResponse = z.infer<typeof loginClientResponseSchema>;
export type RegisterClientResponse = z.infer<typeof registerClientResponseSchema>;

/** Shape of the backend login/register response (accessToken in body, refreshToken in HttpOnly cookie). */
export const loginBackendResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

/** Shape of the backend refresh response. */
export const refreshBackendResponseSchema = z.object({
  accessToken: z.string(),
});

export type LoginBackendResponse = z.infer<typeof loginBackendResponseSchema>;
export type RefreshBackendResponse = z.infer<typeof refreshBackendResponseSchema>;
