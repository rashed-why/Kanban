import { z } from "zod";

/** Mirrors backend CreateUserDto limits. */
const signupNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const signupEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be at most 255 characters")
  .email("Invalid email address");

const signupPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const signupFormSchema = z.object({
  name: signupNameSchema,
  email: signupEmailSchema,
  password: signupPasswordSchema,
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
