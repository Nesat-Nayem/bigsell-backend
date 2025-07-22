import { Document, Types } from 'mongoose';

// Payment Method Types
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash_on_delivery';

// Payment Status Types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

// Razorpay Payment Interface
export interface IRazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Payment Gateway Response
export interface IPaymentGatewayResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number;
}

// Refund Information
export interface IRefundInfo {
  refundId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Date;
  refundedBy?: Types.ObjectId;
}

// Main Payment Interface
export interface IPayment extends Document {
  // Basic Information
  paymentId: string; // Our internal payment ID
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Amount Details
  amount: number; // Amount in smallest currency unit (paisa for INR)
  currency: string;
  amountRefunded: number;
  
  // Payment Details
  method: PaymentMethod;
  status: PaymentStatus;
  
  // Razorpay Details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Gateway Response
  gatewayResponse?: IPaymentGatewayResponse;
  
  // Transaction Details
  description?: string;
  notes?: Record<string, any>;
  
  // Customer Details
  customerEmail: string;
  customerPhone: string;
  
  // Refund Information
  refunds: IRefundInfo[];
  
  // Failure Details
  failureReason?: string;
  errorCode?: string;
  errorDescription?: string;
  
  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance Methods
  addRefund(refundInfo: Partial<IRefundInfo>): Promise<IPayment>;
  markCompleted(gatewayResponse?: IPaymentGatewayResponse): Promise<IPayment>;
  markFailed(reason: string, errorCode?: string, errorDescription?: string): Promise<IPayment>;
}

// Create Payment Request
export interface ICreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  description?: string;
  notes?: Record<string, any>;
  customerEmail?: string;
  customerPhone?: string;
}

// Verify Payment Request
export interface IVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Refund Request
export interface IRefundRequest {
  amount?: number; // If not provided, full refund
  reason: string;
  notes?: Record<string, any>;
}

// Payment Filter
export interface IPaymentFilter {
  userId?: string;
  orderId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  isDeleted?: boolean;
}

// Payment Summary
export interface IPaymentSummary {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRefunded: number;
  methodBreakdown: {
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];
}
