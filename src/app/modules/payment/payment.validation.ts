import { z } from 'zod';

export const createRazorpayOrderValidation = z.object({
  hotelId: z.string().optional(),
  tableNumber: z.string().optional(),
  orderAmount: z.number().positive("Order amount must be positive").optional(),
});

export const verifyRazorpayPaymentValidation = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
  orderId: z.string().min(1, "Order ID is required"),
});

export const createPackagePaymentOrderValidation = z.object({
  orderAmount: z.number().positive("Order amount must be positive"),
  packageName: z.string().optional(),
});

export const verifyPackagePaymentValidation = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
  contractData: z.any().optional(),
});
