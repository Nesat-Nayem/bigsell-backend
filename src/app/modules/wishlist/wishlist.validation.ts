import { z } from 'zod';

// Add to Wishlist Validation
export const addToWishlistValidation = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    notes: z.string().max(500, 'Notes too long').optional(),
  }),
});

// Remove from Wishlist Validation
export const removeFromWishlistValidation = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

// Update Wishlist Item Validation
export const updateWishlistItemValidation = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    notes: z.string().max(500, 'Notes too long').optional(),
  }),
});

// Get Wishlist Validation
export const getWishlistValidation = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(10),
    sort: z.string().optional().default('-addedAt'),
    category: z.string().optional(),
    search: z.string().optional(),
  }).optional(),
});

// Check Item in Wishlist Validation
export const checkItemInWishlistValidation = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

export const WishlistValidation = {
  addToWishlistValidation,
  removeFromWishlistValidation,
  updateWishlistItemValidation,
  getWishlistValidation,
  checkItemInWishlistValidation,
};
