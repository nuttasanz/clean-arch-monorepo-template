import { z } from "zod";
import {
  displayNameSchema,
  nameSchema,
  passwordSchema,
  phoneNumberSchema,
  usernameSchema,
} from "../validators";

export const createUserByAdminSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: displayNameSchema,
  username: usernameSchema,
  email: z.email(),
  password: passwordSchema,
  phoneNumber: phoneNumberSchema,
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export type CreateUserByAdminDTO = z.infer<typeof createUserByAdminSchema>;
