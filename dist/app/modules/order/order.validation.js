"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidation = exports.updatePaymentStatusValidation = exports.returnOrderValidation = exports.cancelOrderValidation = exports.getOrderByIdValidation = exports.getOrdersValidation = exports.updateOrderStatusValidation = exports.createOrderValidation = void 0;
const zod_1 = require("zod");
// Shipping Address Validation
const shippingAddressValidation = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
    email: zod_1.z.string().email('Invalid email format'),
    addressLine1: zod_1.z.string().min(1, 'Address line 1 is required').max(200, 'Address too long'),
    addressLine2: zod_1.z.string().max(200, 'Address too long').optional(),
    city: zod_1.z.string().min(1, 'City is required').max(50, 'City name too long'),
    state: zod_1.z.string().min(1, 'State is required').max(50, 'State name too long'),
    postalCode: zod_1.z.string().min(1, 'Postal code is required').max(10, 'Postal code too long'),
    country: zod_1.z.string().min(1, 'Country is required').max(50, 'Country name too long').default('Bangladesh'),
    isDefault: zod_1.z.boolean().optional().default(false),
});
// Order Item Validation
const orderItemValidation = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
    selectedColor: zod_1.z.string().optional(),
    selectedSize: zod_1.z.string().optional(),
});
// Create Order Validation
exports.createOrderValidation = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(orderItemValidation).min(1, 'At least one item is required'),
        shippingAddress: shippingAddressValidation,
        billingAddress: shippingAddressValidation.optional(),
        paymentMethod: zod_1.z.enum(['card', 'cash_on_delivery', 'bank_transfer', 'digital_wallet']),
        shippingMethod: zod_1.z.string().min(1, 'Shipping method is required'),
        notes: zod_1.z.string().max(500, 'Notes too long').optional(),
        couponCode: zod_1.z.string().optional(),
    }),
});
// Update Order Status Validation
exports.updateOrderStatusValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Order ID is required'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
        note: zod_1.z.string().max(500, 'Note too long').optional(),
        trackingNumber: zod_1.z.string().optional(),
        estimatedDelivery: zod_1.z.string().optional(),
    }),
});
// Get Orders Validation
exports.getOrdersValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).optional().default(1),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).optional().default(10),
        status: zod_1.z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
        paymentStatus: zod_1.z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        sort: zod_1.z.string().optional().default('-orderDate'),
    }).optional(),
});
// Get Single Order Validation
exports.getOrderByIdValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Order ID is required'),
    }),
});
// Cancel Order Validation
exports.cancelOrderValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Order ID is required'),
    }),
    body: zod_1.z.object({
        reason: zod_1.z.string().min(1, 'Cancel reason is required').max(500, 'Reason too long'),
    }),
});
// Return Order Validation
exports.returnOrderValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Order ID is required'),
    }),
    body: zod_1.z.object({
        reason: zod_1.z.string().min(1, 'Return reason is required').max(500, 'Reason too long'),
    }),
});
// Update Payment Status Validation
exports.updatePaymentStatusValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Order ID is required'),
    }),
    body: zod_1.z.object({
        paymentStatus: zod_1.z.enum(['pending', 'paid', 'failed', 'refunded']),
        transactionId: zod_1.z.string().optional(),
        paymentDate: zod_1.z.string().optional(),
    }),
});
exports.OrderValidation = {
    createOrderValidation: exports.createOrderValidation,
    updateOrderStatusValidation: exports.updateOrderStatusValidation,
    getOrdersValidation: exports.getOrdersValidation,
    getOrderByIdValidation: exports.getOrderByIdValidation,
    cancelOrderValidation: exports.cancelOrderValidation,
    returnOrderValidation: exports.returnOrderValidation,
    updatePaymentStatusValidation: exports.updatePaymentStatusValidation,
};
