"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffOrderUpdateValidation = exports.staffOrderCreateValidation = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    menuItem: zod_1.z.string().min(1, "Menu item ID is required"),
    quantity: zod_1.z.number().min(1, "Quantity must be at least 1"),
    size: zod_1.z.string().min(1, "Size is required"),
    addons: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string().min(1, "Addon key is required"),
        quantity: zod_1.z.number().min(1, "Addon quantity must be at least 1")
    })).optional(),
    price: zod_1.z.number().min(0, "Price must be a positive number")
});
exports.staffOrderCreateValidation = zod_1.z.object({
    paymentMethod: zod_1.z.string().min(1, "Payment method is required"),
    paymentId: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    items: zod_1.z.array(orderItemSchema).min(1, "At least one item is required"),
    totalAmount: zod_1.z.number().min(0, "Total amount must be a positive number"),
    tableNumber: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().optional(),
});
const orderItemUpdateSchema = zod_1.z.object({
    menuItem: zod_1.z.string().min(1, "Menu item ID is required"),
    quantity: zod_1.z.number().min(1, "Quantity must be at least 1"),
    size: zod_1.z.string().min(1, "Size is required"),
    addons: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string().min(1, "Addon key is required"),
        quantity: zod_1.z.number().min(1, "Addon quantity must be at least 1")
    })).optional(),
    price: zod_1.z.number().min(0, "Price must be a positive number")
});
exports.staffOrderUpdateValidation = zod_1.z.object({
    paymentMethod: zod_1.z.string().min(1, "Payment method is required").optional(),
    paymentStatus: zod_1.z.enum(['pending', 'completed', 'failed']).optional(),
    paymentId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'processing', 'delivered', 'cancelled']).optional(),
    items: zod_1.z.array(orderItemUpdateSchema).min(1, "At least one item is required").optional(),
    totalAmount: zod_1.z.number().min(0, "Total amount must be a positive number").optional(),
    tableNumber: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().optional()
});
