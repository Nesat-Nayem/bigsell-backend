import { z } from 'zod';

export const shippingPolicyValidation = z.object({
  content: z.string().min(1, 'Shipping policy content is required')
});
