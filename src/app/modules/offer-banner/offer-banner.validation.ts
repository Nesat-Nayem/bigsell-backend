import { z } from 'zod';

export const offerBannerValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  offer: z.string().min(1, 'Offer is required'),
  url: z.string().min(1, 'URL is required'),
  image: z.string().min(1, 'Image is required'),
});

export const updateOfferBannerValidation = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  offer: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
});
