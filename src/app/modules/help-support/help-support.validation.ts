import { z } from 'zod';

export const helpSupportValidation = z.object({
  content: z.string().min(1, 'Help and support content is required')
});