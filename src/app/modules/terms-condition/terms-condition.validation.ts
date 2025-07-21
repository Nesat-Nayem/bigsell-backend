import { z } from 'zod';

export const TermsConditionValidation = z.object({
  content: z.string().min(1, 'Privacy policy content is required')
});