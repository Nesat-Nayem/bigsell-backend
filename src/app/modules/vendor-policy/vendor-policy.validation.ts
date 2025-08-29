import { z } from 'zod';

export const vendorPolicyValidation = z.object({
  content: z.string().min(1, 'Vendor policy content is required')
});
