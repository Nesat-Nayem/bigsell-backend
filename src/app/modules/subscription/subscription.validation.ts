import { z } from 'zod';

export const subscriptionValidation = z.object({
  name: z.string().min(1, 'Plan name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  color: z.string().optional(),
  features: z.array(z.string()).default([]).optional(),
  includeIds: z.array(z.string()).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaTags: z.array(z.string()).optional(),
  metaDescription: z.string().optional(),
});

export const subscriptionUpdateValidation = z.object({
  name: z.string().min(1, 'Plan name is required').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  color: z.string().optional(),
  features: z.array(z.string()).optional(),
  includeIds: z.array(z.string()).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaTags: z.array(z.string()).optional(),
  metaDescription: z.string().optional(),
});
