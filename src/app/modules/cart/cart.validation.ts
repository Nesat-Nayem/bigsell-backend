import { z } from 'zod';

const cartItemAddonSchema = z.object({
  key: z.string().min(1, "Addon key is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1")
});


export const addToCartValidation = z.object({
  // Change from productId to menuItemId and hotelId
  menuItemId: z.string().min(1, "Menu item ID is required"),
  hotelId: z.string().min(1, "Hotel ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  size: z.string().min(1, "Size is required"),
  addons: z.array(cartItemAddonSchema).optional(),
  specialInstructions: z.string().optional(),
  tableNumber: z.string().optional(),
});

export const updateCartItemValidation = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  size: z.string().min(1, "Size is required").optional(),
  addons: z.array(cartItemAddonSchema).optional(),
  specialInstructions: z.string().optional(),
  hotelId: z.string().optional(),
  tableNumber: z.string().optional(),
});


