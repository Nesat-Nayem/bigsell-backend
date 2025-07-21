import { z } from 'zod';

export const faqValidation = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional()
});

export const faqUpdateValidation = z.object({
  question: z.string().min(1, 'Question is required').optional(),
  answer: z.string().min(1, 'Answer is required').optional(),
  category: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional()
});