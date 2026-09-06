import { z } from "zod";

export const createBoardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
});

export type CreateBoardFormValues = z.infer<typeof createBoardFormSchema>;

export const createColumnFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
});

export type CreateColumnFormValues = z.infer<typeof createColumnFormSchema>;

export const createTaskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

export const updateTaskFormSchema = createTaskFormSchema;

export type UpdateTaskFormValues = z.infer<typeof updateTaskFormSchema>;

export const shareBoardFormSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, "Email must be at most 255 characters")
    .email("Enter a valid email"),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export type ShareBoardFormValues = z.infer<typeof shareBoardFormSchema>;
