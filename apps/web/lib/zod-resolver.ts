import type { ZodType } from "zod";

/**
 * Custom Zod v4 resolver for @mantine/form.
 * mantine-form-zod-resolver only supports Zod v3; this works with Zod v4's
 * `.issues` API (replacing the deprecated `.errors`).
 */
export function zodResolver<T>(schema: ZodType<T>) {
  return (values: T): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (path && !(path in errors)) {
        errors[path] = issue.message;
      }
    }
    return errors;
  };
}
