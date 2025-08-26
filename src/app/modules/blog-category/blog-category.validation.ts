import { z } from 'zod';

export const blogCategoryValidation = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  status: z.enum(['Active', 'Inactive']).default('Active')
});

export const blogCategoryUpdateValidation = z.object({
  categoryName: z.string().min(1, 'Category name is required').optional(),
  status: z.enum(['Active', 'Inactive']).optional()
});
