import { z } from 'zod';

// Add to Cart Validation
export const addToCartValidation = z.object({
  body: z.object({
    productId: z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
  }),
});

// Update Cart Item Validation
export const updateCartItemValidation = z.object({
  params: z.object({
    productId: z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
  }),
});

// Remove Cart Item Validation
export const removeCartItemValidation = z.object({
  params: z.object({
    productId: z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
  }),
  query: z.object({
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
  }).optional(),
});

// Get Cart Validation (optional query parameters)
export const getCartValidation = z.object({
  query: z.object({
    populate: z.enum(['true', 'false']).optional().default('true'),
  }).optional(),
});

export const CartValidation = {
  addToCartValidation,
  updateCartItemValidation,
  removeCartItemValidation,
  getCartValidation,
};
