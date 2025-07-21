import { z } from 'zod';

export const createCouponValidation = z.object({
  couponCode: z.string().min(3, 'Coupon code must be at least 3 characters long'),
  discountPercentage: z.number().min(0).max(100),
  maxDiscountAmount: z.number().min(0),
  minOrderAmount: z.number().min(0).optional().default(0),
  validFrom: z.string().transform((str) => new Date(str)),
  validUntil: z.string().transform((str) => new Date(str)),
  usageLimit: z.number().int().min(1),
  usagePerUser: z.number().int().min(1).optional().default(1),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  isActive: z.boolean().optional().default(true),
});

export const updateCouponValidation = createCouponValidation.partial(); 
