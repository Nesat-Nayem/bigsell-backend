import { z } from 'zod';

export const blogValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDesc: z.string().min(1, 'Short description is required'),
  longDesc: z.string().min(1, 'Long description is required'),
  image: z.string().min(1, 'Image is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Active', 'Inactive']).default('Active')
});

export const updateBlogValidation = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  shortDesc: z.string().min(1, 'Short description is required').optional(),
  longDesc: z.string().min(1, 'Long description is required').optional(),
  image: z.string().min(1, 'Image is required').optional(),
  category: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional()
});