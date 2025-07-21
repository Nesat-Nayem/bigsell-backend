import { z } from 'zod';

const orderItemSchema = z.object({
  menuItem: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  size: z.string().min(1, "Size is required"),
  addons: z.array(
    z.object({
      key: z.string().min(1, "Addon key is required"),
      quantity: z.number().min(1, "Addon quantity must be at least 1")
    })
  ).optional(),
  price: z.number().min(0, "Price must be a positive number")
});

export const staffOrderCreateValidation = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentId: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0, "Total amount must be a positive number"),
  tableNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const orderItemUpdateSchema = z.object({
  menuItem: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  size: z.string().min(1, "Size is required"),
  addons: z.array(
    z.object({
      key: z.string().min(1, "Addon key is required"),
      quantity: z.number().min(1, "Addon quantity must be at least 1")
    })
  ).optional(),
  price: z.number().min(0, "Price must be a positive number")
});

export const staffOrderUpdateValidation = z.object({
  paymentMethod: z.string().min(1, "Payment method is required").optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed']).optional(),
  paymentId: z.string().optional(),
  status: z.enum(['pending', 'processing', 'delivered', 'cancelled']).optional(),
  items: z.array(orderItemUpdateSchema).min(1, "At least one item is required").optional(),
  totalAmount: z.number().min(0, "Total amount must be a positive number").optional(),
  tableNumber: z.string().optional(),
  specialInstructions: z.string().optional()
});