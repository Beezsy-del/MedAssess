import { z } from "zod";

export const staffPasswordSchema = z
  .string()
  .min(12, "Use at least 12 characters for the initial password.")
  .max(72, "The initial password is too long. Use at most 72 characters.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, {
    message:
      "The initial password is too long when encoded. Use a shorter password.",
  });
