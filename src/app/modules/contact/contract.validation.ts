import { z } from 'zod';

export const contractValidation = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});


export const contractUpdateValidation = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  message: z.string().min(1, 'Message is required').optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});
