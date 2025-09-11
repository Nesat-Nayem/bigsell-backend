import { z } from 'zod';

// Shipping Address Validation
const shippingAddressValidation = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  email: z.string().email('Invalid email format'),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200, 'Address too long'),
  addressLine2: z.string().max(200, 'Address too long').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(10, 'Postal code too long'),
  country: z.string().min(1, 'Country is required').max(50, 'Country name too long').default('Bangladesh'),
  isDefault: z.boolean().optional().default(false),
});

// Order Item Validation
const orderItemValidation = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),
});

// Create Order Validation
export const createOrderValidation = z.object({
  body: z.object({
    items: z.array(orderItemValidation).min(1, 'At least one item is required'),
    shippingAddress: shippingAddressValidation,
    billingAddress: shippingAddressValidation.optional(),
    paymentMethod: z.enum(['card', 'cash_on_delivery', 'bank_transfer', 'digital_wallet']),
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
    shippingMethod: z.string().min(1, 'Shipping method is required'),
    notes: z.string().max(500, 'Notes too long').optional(),
    couponCode: z.string().optional(),
  }),
});

// Update Order Status Validation
export const updateOrderStatusValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
    note: z.string().max(500, 'Note too long').optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.string().optional(),
  }),
});

// Get Orders Validation
export const getOrdersValidation = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(10),
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sort: z.string().optional().default('-orderDate'),
  }).optional(),
});

// Get Single Order Validation
export const getOrderByIdValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
});

// Cancel Order Validation
export const cancelOrderValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Cancel reason is required').max(500, 'Reason too long'),
  }),
});

// Return Order Validation
export const returnOrderValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Return reason is required').max(500, 'Reason too long'),
  }),
});

// Update Payment Status Validation
export const updatePaymentStatusValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
    transactionId: z.string().optional(),
    paymentDate: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderValidation,
  updateOrderStatusValidation,
  getOrdersValidation,
  getOrderByIdValidation,
  cancelOrderValidation,
  returnOrderValidation,
  updatePaymentStatusValidation,
};
