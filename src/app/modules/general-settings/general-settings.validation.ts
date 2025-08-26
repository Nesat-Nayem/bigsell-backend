import { z } from 'zod';

export const generalSettingsUpdateValidation = z.object({
  number: z.string().min(1).optional(),
  email: z.string().email().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedIn: z.string().url().optional(),
  twitter: z.string().url().optional(),
  youtube: z.string().url().optional(),
  headerTab: z.string().optional(),
  address: z.string().optional(),
  iframe: z.string().optional(),
});
