import { z } from 'zod';

export const discountOfferValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  offer: z.string().min(1, 'Offer is required'),
  image: z.string().min(1, 'Image is required'),
});

export const updateDiscountOfferValidation = z.object({
  title: z.string().min(1).optional(),
  offer: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
});
