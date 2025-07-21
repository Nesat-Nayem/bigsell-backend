"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusValidation = exports.updateOrderStatusValidation = exports.createOrderValidation = void 0;
const zod_1 = require("zod");
exports.createOrderValidation = zod_1.z.object({
    hotelId: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().min(1, "Payment method is required"),
    paymentId: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().optional(),
    selectedItemIds: zod_1.z.array(zod_1.z.string()).optional(), // Array of selected item IDs
});
exports.updateOrderStatusValidation = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'processing', 'delivered', 'cancelled'])
});
exports.updatePaymentStatusValidation = zod_1.z.object({
    paymentStatus: zod_1.z.enum(['pending', 'partially-paid', 'paid', 'failed']),
    paymentId: zod_1.z.string().optional()
});
