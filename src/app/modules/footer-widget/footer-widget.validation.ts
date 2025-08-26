import { z } from 'zod';

export const footerWidgetCreateValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
});

export const footerWidgetUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
});
