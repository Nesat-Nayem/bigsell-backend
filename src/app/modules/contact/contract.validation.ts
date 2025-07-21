import { z } from 'zod';

export const contractValidation = z.object({
  name: z.string().min(1, 'Name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  emailAddress: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});


export const contractUpdateValidation = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  brandName: z.string().min(1, 'Brand name is required').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').optional(),
  emailAddress: z.string().email('Invalid email address').optional(),
  message: z.string().min(1, 'Message is required').optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});
