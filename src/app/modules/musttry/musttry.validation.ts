import { z } from 'zod';

export const mustTryValidation = z.object({
  title: z.string().min(1, 'MustTry title is required'),
  image: z.string().min(1, 'Image is required'),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const mustTryUpdateValidation = z.object({
  title: z.string().min(1, 'MustTry title is required').optional(),
  image: z.string().min(1, 'Image is required').optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});