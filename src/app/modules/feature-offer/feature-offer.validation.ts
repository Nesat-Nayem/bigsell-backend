import { z } from 'zod';

export const featureOfferValidation = z.object({
  title: z.string().min(1, 'Feature offer title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  url: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const featureOfferUpdateValidation = z.object({
  title: z.string().min(1, 'Feature offer title is required').optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required').optional(),
  url: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});