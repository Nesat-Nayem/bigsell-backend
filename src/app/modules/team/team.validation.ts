import { z } from 'zod';

export const teamValidation = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  image: z.string().min(1, 'Image is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateTeamValidation = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});
