import { z } from 'zod';

export const paymentPolicyValidation = z.object({
  content: z.string().min(1, 'Payment policy content is required')
});
