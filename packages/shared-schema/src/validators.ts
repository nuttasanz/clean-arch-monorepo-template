import { z } from "zod";

export const nameSchema = z
  .string()
  .regex(/^[a-zA-Z\u0E00-\u0E7F]+$/)
  .optional();

export const displayNameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9\u0E00-\u0E7F ]+$/)
  .optional();

export const usernameSchema = z
  .string()
  .min(4)
  .regex(/^[a-zA-Z0-9]+$/);

export const phoneNumberSchema = z
  .string()
  .length(10)
  .regex(/^[a-zA-Z0-9]+$/)
  .optional();

export const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  );
