"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistValidation = exports.checkItemInWishlistValidation = exports.getWishlistValidation = exports.updateWishlistItemValidation = exports.removeFromWishlistValidation = exports.addToWishlistValidation = void 0;
const zod_1 = require("zod");
// Add to Wishlist Validation
exports.addToWishlistValidation = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
        notes: zod_1.z.string().max(500, 'Notes too long').optional(),
    }),
});
// Remove from Wishlist Validation
exports.removeFromWishlistValidation = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
    }),
});
// Update Wishlist Item Validation
exports.updateWishlistItemValidation = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
    }),
    body: zod_1.z.object({
        notes: zod_1.z.string().max(500, 'Notes too long').optional(),
    }),
});
// Get Wishlist Validation
exports.getWishlistValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).optional().default(1),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).optional().default(10),
        sort: zod_1.z.string().optional().default('-addedAt'),
        category: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
    }).optional(),
});
// Check Item in Wishlist Validation
exports.checkItemInWishlistValidation = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
    }),
});
exports.WishlistValidation = {
    addToWishlistValidation: exports.addToWishlistValidation,
    removeFromWishlistValidation: exports.removeFromWishlistValidation,
    updateWishlistItemValidation: exports.updateWishlistItemValidation,
    getWishlistValidation: exports.getWishlistValidation,
    checkItemInWishlistValidation: exports.checkItemInWishlistValidation,
};
