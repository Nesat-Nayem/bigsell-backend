"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartValidation = exports.getCartValidation = exports.removeCartItemValidation = exports.updateCartItemValidation = exports.addToCartValidation = void 0;
const zod_1 = require("zod");
// Add to Cart Validation
exports.addToCartValidation = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
        selectedColor: zod_1.z.string().optional(),
        selectedSize: zod_1.z.string().optional(),
    }),
});
// Update Cart Item Validation
exports.updateCartItemValidation = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
    }),
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
        selectedColor: zod_1.z.string().optional(),
        selectedSize: zod_1.z.string().optional(),
    }),
});
// Remove Cart Item Validation
exports.removeCartItemValidation = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().nonempty('Product ID is required').min(1, 'Product ID cannot be empty'),
    }),
    query: zod_1.z.object({
        selectedColor: zod_1.z.string().optional(),
        selectedSize: zod_1.z.string().optional(),
    }).optional(),
});
// Get Cart Validation (optional query parameters)
exports.getCartValidation = zod_1.z.object({
    query: zod_1.z.object({
        populate: zod_1.z.enum(['true', 'false']).optional().default('true'),
    }).optional(),
});
exports.CartValidation = {
    addToCartValidation: exports.addToCartValidation,
    updateCartItemValidation: exports.updateCartItemValidation,
    removeCartItemValidation: exports.removeCartItemValidation,
    getCartValidation: exports.getCartValidation,
};
