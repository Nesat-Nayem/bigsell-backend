import { z } from 'zod'

export const vendorApplyValidation = z.object({
  vendorName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(1),
  gstNo: z.string().optional(),

  subscriptionId: z.string().optional(),
  planName: z.string().min(1).optional(),
  planPrice: z.number().optional(),
  planBillingCycle: z.enum(['monthly', 'yearly']).optional(),
  planColor: z.string().optional(),

  aadharUrl: z.string().url(),
  panUrl: z.string().url(),

  paymentStatus: z.enum(['pending', 'done', 'failed']).optional(),
  paymentAmount: z.number().optional(),
})

export const vendorUpdateStatusValidation = z.object({
  kycStatus: z.enum(['pending', 'approved', 'rejected']),
})

export const vendorUpdateValidation = z.object({
  vendorName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNo: z.string().optional(),
  paymentStatus: z.enum(['pending', 'done', 'failed']).optional(),
  paymentAmount: z.number().optional(),
})
