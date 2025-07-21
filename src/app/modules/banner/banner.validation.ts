import { z } from 'zod';

export const bannerValidation = z.object({
  title: z.string().min(1, 'Banner title is required'),
  image: z.string().min(1, 'Image is required'),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const bannerUpdateValidation = z.object({
  title: z.string().min(1, 'Banner title is required').optional(),
  image: z.string().min(1, 'Image is required').optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});


