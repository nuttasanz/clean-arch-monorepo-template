import { z } from "zod";
import {
  displayNameSchema,
  nameSchema,
  passwordSchema,
  phoneNumberSchema,
  usernameSchema,
} from "../validators";

export const registerUserSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: displayNameSchema,
  username: usernameSchema,
  email: z.email(),
  password: passwordSchema,
  phoneNumber: phoneNumberSchema,
});

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
