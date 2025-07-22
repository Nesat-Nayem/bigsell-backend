"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = exports.getPaymentSummaryValidation = exports.webhookValidation = exports.updatePaymentStatusValidation = exports.refundPaymentValidation = exports.getPaymentByIdValidation = exports.getPaymentsValidation = exports.verifyPaymentValidation = exports.createPaymentValidation = void 0;
const zod_1 = require("zod");
// Create Payment Validation
exports.createPaymentValidation = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1, 'Order ID is required'),
        amount: zod_1.z.number().min(1, 'Amount must be greater than 0'),
        currency: zod_1.z.string().optional().default('INR'),
        method: zod_1.z.enum(['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery']),
        description: zod_1.z.string().max(500, 'Description too long').optional(),
        notes: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        customerEmail: zod_1.z.string().email('Invalid email format').optional(),
        customerPhone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long').optional(),
    }),
});
// Verify Payment Validation
exports.verifyPaymentValidation = zod_1.z.object({
    body: zod_1.z.object({
        razorpay_order_id: zod_1.z.string().min(1, 'Razorpay order ID is required'),
        razorpay_payment_id: zod_1.z.string().min(1, 'Razorpay payment ID is required'),
        razorpay_signature: zod_1.z.string().min(1, 'Razorpay signature is required'),
    }),
});
// Get Payments Validation
exports.getPaymentsValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).optional().default(1),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).optional().default(10),
        status: zod_1.z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']).optional(),
        method: zod_1.z.enum(['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery']).optional(),
        orderId: zod_1.z.string().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        sort: zod_1.z.string().optional().default('-initiatedAt'),
    }).optional(),
});
// Get Single Payment Validation
exports.getPaymentByIdValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Payment ID is required'),
    }),
});
// Refund Payment Validation
exports.refundPaymentValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Payment ID is required'),
    }),
    body: zod_1.z.object({
        amount: zod_1.z.number().min(1, 'Refund amount must be greater than 0').optional(),
        reason: zod_1.z.string().min(1, 'Refund reason is required').max(500, 'Reason too long'),
        notes: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
// Update Payment Status Validation
exports.updatePaymentStatusValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Payment ID is required'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']),
        failureReason: zod_1.z.string().max(500, 'Failure reason too long').optional(),
        errorCode: zod_1.z.string().optional(),
        errorDescription: zod_1.z.string().max(500, 'Error description too long').optional(),
    }),
});
// Webhook Validation (Razorpay)
exports.webhookValidation = zod_1.z.object({
    body: zod_1.z.object({
        entity: zod_1.z.string(),
        account_id: zod_1.z.string(),
        event: zod_1.z.string(),
        contains: zod_1.z.array(zod_1.z.string()),
        payload: zod_1.z.object({
            payment: zod_1.z.object({
                entity: zod_1.z.object({
                    id: zod_1.z.string(),
                    entity: zod_1.z.string(),
                    amount: zod_1.z.number(),
                    currency: zod_1.z.string(),
                    status: zod_1.z.string(),
                    order_id: zod_1.z.string().optional(),
                    invoice_id: zod_1.z.string().optional(),
                    international: zod_1.z.boolean(),
                    method: zod_1.z.string(),
                    amount_refunded: zod_1.z.number(),
                    refund_status: zod_1.z.string().optional(),
                    captured: zod_1.z.boolean(),
                    description: zod_1.z.string().optional(),
                    card_id: zod_1.z.string().optional(),
                    bank: zod_1.z.string().optional(),
                    wallet: zod_1.z.string().optional(),
                    vpa: zod_1.z.string().optional(),
                    email: zod_1.z.string(),
                    contact: zod_1.z.string(),
                    notes: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
                    fee: zod_1.z.number().optional(),
                    tax: zod_1.z.number().optional(),
                    error_code: zod_1.z.string().optional(),
                    error_description: zod_1.z.string().optional(),
                    error_source: zod_1.z.string().optional(),
                    error_step: zod_1.z.string().optional(),
                    error_reason: zod_1.z.string().optional(),
                    created_at: zod_1.z.number(),
                }),
            }),
        }),
        created_at: zod_1.z.number(),
    }),
});
// Get Payment Summary Validation
exports.getPaymentSummaryValidation = zod_1.z.object({
    query: zod_1.z.object({
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        userId: zod_1.z.string().optional(),
    }).optional(),
});
exports.PaymentValidation = {
    createPaymentValidation: exports.createPaymentValidation,
    verifyPaymentValidation: exports.verifyPaymentValidation,
    getPaymentsValidation: exports.getPaymentsValidation,
    getPaymentByIdValidation: exports.getPaymentByIdValidation,
    refundPaymentValidation: exports.refundPaymentValidation,
    updatePaymentStatusValidation: exports.updatePaymentStatusValidation,
    webhookValidation: exports.webhookValidation,
    getPaymentSummaryValidation: exports.getPaymentSummaryValidation,
};
