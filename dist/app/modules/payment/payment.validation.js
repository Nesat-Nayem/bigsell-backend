"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPackagePaymentValidation = exports.createPackagePaymentOrderValidation = exports.verifyRazorpayPaymentValidation = exports.createRazorpayOrderValidation = void 0;
const zod_1 = require("zod");
exports.createRazorpayOrderValidation = zod_1.z.object({
    hotelId: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
    orderAmount: zod_1.z.number().positive("Order amount must be positive").optional(),
});
exports.verifyRazorpayPaymentValidation = zod_1.z.object({
    razorpayOrderId: zod_1.z.string().min(1, "Razorpay order ID is required"),
    razorpayPaymentId: zod_1.z.string().min(1, "Razorpay payment ID is required"),
    razorpaySignature: zod_1.z.string().min(1, "Razorpay signature is required"),
    orderId: zod_1.z.string().min(1, "Order ID is required"),
});
exports.createPackagePaymentOrderValidation = zod_1.z.object({
    orderAmount: zod_1.z.number().positive("Order amount must be positive"),
    packageName: zod_1.z.string().optional(),
});
exports.verifyPackagePaymentValidation = zod_1.z.object({
    razorpayOrderId: zod_1.z.string().min(1, "Razorpay order ID is required"),
    razorpayPaymentId: zod_1.z.string().min(1, "Razorpay payment ID is required"),
    razorpaySignature: zod_1.z.string().min(1, "Razorpay signature is required"),
    contractData: zod_1.z.any().optional(),
});
