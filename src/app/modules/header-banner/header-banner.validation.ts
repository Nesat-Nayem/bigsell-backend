import { z } from 'zod';

export const headerBannerValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().min(1, 'Image is required'),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export const headerBannerUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});
