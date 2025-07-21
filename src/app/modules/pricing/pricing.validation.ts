import { z } from "zod";

export const pricingValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  color: z.string().min(3, "Color must be at least 3 characters long"),
  isDeleted: z.boolean().optional(),
});



export const pricingUpdateValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long").optional(),
  price: z.string().min(1, "Price is required").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  features: z.array(z.string()).min(1, "At least one feature is required").optional(),
  color: z.string().min(3, "Color must be at least 3 characters long").optional(),
  isDeleted: z.boolean().optional(),
});