import { z } from "zod";
import { passwordSchema, usernameSchema } from "../validators";

export const loginUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export type LoginUserDTO = z.infer<typeof loginUserSchema>;
