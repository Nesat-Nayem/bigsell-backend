import { z } from 'zod'

export const includeValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
})

export const includeUpdateValidation = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
})
