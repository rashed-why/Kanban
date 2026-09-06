import type { ZodError, ZodType } from "zod";

export function getZodFormErrors(error: ZodError) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function toFormikValidate<T>(schema: ZodType<T>) {
  return (values: T) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {};
    }

    return getZodFormErrors(result.error);
  };
}
