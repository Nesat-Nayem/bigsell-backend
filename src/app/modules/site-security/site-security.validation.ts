import { z } from 'zod';

export const siteSecurityValidation = z.object({
  content: z.string().min(1, 'Site security content is required')
});
