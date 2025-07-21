import { z } from "zod";

export const categoryValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  image: z.string().url("Image must be a valid URL"),
  isDeleted: z.boolean().optional(),
});

export const categoryUpdateValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long").optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  isDeleted: z.boolean().optional(),
});

