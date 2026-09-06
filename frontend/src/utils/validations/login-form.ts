import { z } from "zod";

/** Mirrors backend LoginDto limits. */
const authEmailSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(255, "Email must be at most 255 characters")
  .email("Invalid email address");

const loginPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const loginFormSchema = z.object({
  email: authEmailSchema,
  password: loginPasswordSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
