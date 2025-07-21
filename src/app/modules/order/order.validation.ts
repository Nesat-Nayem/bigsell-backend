import { z } from 'zod';

export const createOrderValidation = z.object({
  hotelId: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentId: z.string().optional(),
  tableNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
  selectedItemIds: z.array(z.string()).optional(), // Array of selected item IDs
});

export const updateOrderStatusValidation = z.object({
  status: z.enum(['pending', 'processing', 'delivered', 'cancelled'])
});

export const updatePaymentStatusValidation = z.object({
  paymentStatus: z.enum(['pending', 'partially-paid', 'paid', 'failed']),
  paymentId: z.string().optional()
});
