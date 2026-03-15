import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "Name must not be empty")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[a-zA-Z\u0E00-\u0E7F]+$/, "Name must contain only letters")
  .optional();

export const displayNameSchema = z
  .string()
  .min(1, "Display name must not be empty")
  .max(100, "Display name must be at most 100 characters")
  .regex(
    /^[a-zA-Z0-9\u0E00-\u0E7F ]+$/,
    "Display name must contain only letters, numbers, and spaces",
  )
  .optional();

export const usernameSchema = z
  .string()
  .min(4, "Username must be at least 4 characters")
  .max(32, "Username must be at most 32 characters")
  .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers");

export const phoneNumberSchema = z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^\d+$/, "Phone number must contain only digits")
  .optional();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must contain uppercase, lowercase, a number, and a special character (@$!%*?&)",
  );
