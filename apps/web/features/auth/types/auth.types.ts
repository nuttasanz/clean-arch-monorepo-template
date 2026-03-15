import { z } from "zod";
import { UserRole } from "@repo/shared";

/**
 * Zod schema for the user object returned by our BFF to the client.
 * Zero-Trust: we validate API responses before passing to UI.
 */
export const authUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.nativeEnum(UserRole),
});

/**
 * Schema for the login BFF response (token is set as HttpOnly cookie, never sent to client JS).
 */
export const loginClientResponseSchema = z.object({
  user: authUserSchema,
});

/**
 * Schema for the register BFF response.
 */
export const registerClientResponseSchema = z.object({
  message: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginClientResponse = z.infer<typeof loginClientResponseSchema>;
export type RegisterClientResponse = z.infer<
  typeof registerClientResponseSchema
>;
