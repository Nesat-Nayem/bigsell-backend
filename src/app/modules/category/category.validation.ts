import { z } from "zod";

export const categoryValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  image: z.string().url("Image must be a valid URL"),
  productCategory: z.string().min(1, 'Product Category is required'),
  productSubcategory: z.string().optional(),
  productSubSubcategory: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const categoryUpdateValidation = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters long")
    .optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  productCategory: z.string().optional(),
  productSubcategory: z.string().optional(),
  productSubSubcategory: z.string().optional(),
  isDeleted: z.boolean().optional(),
});
