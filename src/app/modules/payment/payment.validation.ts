import { z } from 'zod';

// Create Payment Validation
export const createPaymentValidation = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    currency: z.string().optional().default('INR'),
    method: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery']),
    description: z.string().max(500, 'Description too long').optional(),
    notes: z.record(z.string(), z.any()).optional(),
    customerEmail: z.string().email('Invalid email format').optional(),
    customerPhone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long').optional(),
  }),
});

// Verify Payment Validation
export const verifyPaymentValidation = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
    razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
  }),
});

// Get Payments Validation
export const getPaymentsValidation = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(10),
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']).optional(),
    method: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery']).optional(),
    orderId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sort: z.string().optional().default('-initiatedAt'),
  }).optional(),
});

// Get Single Payment Validation
export const getPaymentByIdValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
});

// Refund Payment Validation
export const refundPaymentValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
  body: z.object({
    amount: z.number().min(1, 'Refund amount must be greater than 0').optional(),
    reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason too long'),
    notes: z.record(z.string(), z.any()).optional(),
  }),
});

// Update Payment Status Validation
export const updatePaymentStatusValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']),
    failureReason: z.string().max(500, 'Failure reason too long').optional(),
    errorCode: z.string().optional(),
    errorDescription: z.string().max(500, 'Error description too long').optional(),
  }),
});

// Webhook Validation (Razorpay)
export const webhookValidation = z.object({
  body: z.object({
    entity: z.string(),
    account_id: z.string(),
    event: z.string(),
    contains: z.array(z.string()),
    payload: z.object({
      payment: z.object({
        entity: z.object({
          id: z.string(),
          entity: z.string(),
          amount: z.number(),
          currency: z.string(),
          status: z.string(),
          order_id: z.string().optional(),
          invoice_id: z.string().optional(),
          international: z.boolean(),
          method: z.string(),
          amount_refunded: z.number(),
          refund_status: z.string().optional(),
          captured: z.boolean(),
          description: z.string().optional(),
          card_id: z.string().optional(),
          bank: z.string().optional(),
          wallet: z.string().optional(),
          vpa: z.string().optional(),
          email: z.string(),
          contact: z.string(),
          notes: z.record(z.string(), z.any()),
          fee: z.number().optional(),
          tax: z.number().optional(),
          error_code: z.string().optional(),
          error_description: z.string().optional(),
          error_source: z.string().optional(),
          error_step: z.string().optional(),
          error_reason: z.string().optional(),
          created_at: z.number(),
        }),
      }),
    }),
    created_at: z.number(),
  }),
});

// Get Payment Summary Validation
export const getPaymentSummaryValidation = z.object({
  query: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    userId: z.string().optional(),
  }).optional(),
});

export const PaymentValidation = {
  createPaymentValidation,
  verifyPaymentValidation,
  getPaymentsValidation,
  getPaymentByIdValidation,
  refundPaymentValidation,
  updatePaymentStatusValidation,
  webhookValidation,
  getPaymentSummaryValidation,
};
