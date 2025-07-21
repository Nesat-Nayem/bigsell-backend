import { z } from 'zod';

export const tableValidation = z.object({
  tableNumber: z.number().int().positive('Table number must be a positive integer'),
  isActive: z.boolean().optional(),
  description: z.string().optional()
});

export const tableUpdateValidation = z.object({
  tableNumber: z.number().int().positive('Table number must be a positive integer').optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional()
});
