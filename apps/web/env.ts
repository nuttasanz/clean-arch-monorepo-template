import { z } from "zod";

const envSchema = z.object({
  BACKEND_API_URL: z.string().url("BACKEND_API_URL must be a valid URL"),
});

export const env = envSchema.parse(process.env);
