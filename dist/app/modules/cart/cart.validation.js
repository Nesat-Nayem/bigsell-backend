"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemValidation = exports.addToCartValidation = void 0;
const zod_1 = require("zod");
const cartItemAddonSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, "Addon key is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1")
});
exports.addToCartValidation = zod_1.z.object({
    // Change from productId to menuItemId and hotelId
    menuItemId: zod_1.z.string().min(1, "Menu item ID is required"),
    hotelId: zod_1.z.string().min(1, "Hotel ID is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
    size: zod_1.z.string().min(1, "Size is required"),
    addons: zod_1.z.array(cartItemAddonSchema).optional(),
    specialInstructions: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
});
exports.updateCartItemValidation = zod_1.z.object({
    itemId: zod_1.z.string().min(1, "Item ID is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1").optional(),
    size: zod_1.z.string().min(1, "Size is required").optional(),
    addons: zod_1.z.array(cartItemAddonSchema).optional(),
    specialInstructions: zod_1.z.string().optional(),
    hotelId: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
});
