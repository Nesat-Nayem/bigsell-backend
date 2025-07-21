import { z } from 'zod';

export const offerValidation = z.object({
  image: z.string().min(1, 'Image is required'),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const offerUpdateValidation = z.object({
  image: z.string().min(1, 'Image is required').optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});
