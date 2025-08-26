import { z } from 'zod';

export const aboutUpdateValidation = z.object({
  aboutUs: z
    .object({
      image: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      subtitle: z.string().min(1).optional(),
      url: z.string().min(1).optional(),
    })
    .optional(),
  counter: z
    .object({
      happyCustomers: z.number().int().nonnegative().optional(),
      electronicsProducts: z.number().int().nonnegative().optional(),
      activeSalesman: z.number().int().nonnegative().optional(),
      storeWorldwide: z.number().int().nonnegative().optional(),
    })
    .optional(),
  aboutInfo: z
    .object({
      image: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
    })
    .optional(),
  whyChooseUs: z
    .array(
      z.object({
        image: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        shortDesc: z.string().min(1).optional(),
      })
    )
    .max(3)
    .optional(),
});
