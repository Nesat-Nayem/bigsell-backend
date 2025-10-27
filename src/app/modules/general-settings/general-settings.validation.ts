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
  freeShippingThreshold: z
    .preprocess((v) => {
      if (v === undefined || v === null || v === '') return undefined;
      if (typeof v === 'number') return v;
      const n = Number(v as any);
      return isNaN(n) ? undefined : n;
    }, z.number().min(0))
    .optional(),
});
