import { z } from 'zod';

export const privacyPolicyValidation = z.object({
  content: z.string().min(1, 'Privacy policy content is required')
});
