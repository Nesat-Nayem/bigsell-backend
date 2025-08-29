import { z } from 'zod';

export const disclaimerValidation = z.object({
  content: z.string().min(1, 'Disclaimer content is required')
});
