import mongoose, { Schema } from 'mongoose';
import { IPayment, IRefundInfo, IPaymentGatewayResponse } from './payment.interface';

// Refund Info Schema
const RefundInfoSchema: Schema = new Schema({
  refundId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
  },
  processedAt: {
    type: Date,
  },
  refundedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { 
  _id: false,
  timestamps: true,
});

// Payment Gateway Response Schema
const PaymentGatewayResponseSchema: Schema = new Schema({
  id: String,
  entity: String,
  amount: Number,
  currency: String,
  status: String,
  order_id: String,
  invoice_id: String,
  international: Boolean,
  method: String,
  amount_refunded: Number,
  refund_status: String,
  captured: Boolean,
  description: String,
  card_id: String,
  bank: String,
  wallet: String,
  vpa: String,
  email: String,
  contact: String,
  notes: Schema.Types.Mixed,
  fee: Number,
  tax: Number,
  error_code: String,
  error_description: String,
  error_source: String,
  error_step: String,
  error_reason: String,
  created_at: Number,
}, { _id: false });

// Main Payment Schema
const PaymentSchema: Schema = new Schema(
  {
    // Basic Information
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Amount Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
    },
    amountRefunded: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Payment Details
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    
    // Razorpay Details
    razorpayOrderId: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    
    // Gateway Response
    gatewayResponse: {
      type: PaymentGatewayResponseSchema,
    },
    
    // Transaction Details
    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // Customer Details
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Refund Information
    refunds: [RefundInfoSchema],
    
    // Failure Details
    failureReason: {
      type: String,
      trim: true,
    },
    errorCode: {
      type: String,
      trim: true,
    },
    errorDescription: {
      type: String,
      trim: true,
    },
    
    // Timestamps
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    
    // Metadata
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata' 
        });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata' 
        });
        if ((ret as any).initiatedAt) {
          (ret as any).initiatedAt = new Date((ret as any).initiatedAt).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata' 
          });
        }
        if ((ret as any).completedAt) {
          (ret as any).completedAt = new Date((ret as any).completedAt).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata' 
          });
        }
        if ((ret as any).failedAt) {
          (ret as any).failedAt = new Date((ret as any).failedAt).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata' 
          });
        }
        return ret;
      }
    }
  }
);

// Indexes for better performance
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ method: 1 });
PaymentSchema.index({ initiatedAt: -1 });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ isDeleted: 1 });

// Generate unique payment ID
PaymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentId) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.paymentId = `PAY-${timestamp}-${random}`;
  }
  
  // Update status timestamps
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'failed':
      case 'cancelled':
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  
  // Update refund status based on refunded amount
  if (this.isModified('amountRefunded')) {
    if ((this as any).amountRefunded > 0) {
      if ((this as any).amountRefunded >= (this as any).amount) {
        this.status = 'refunded';
      } else {
        this.status = 'partially_refunded';
      }
    }
  }
  
  next();
});

// Static method to find user payments
PaymentSchema.statics.findUserPayments = function(userId: string, options: any = {}) {
  const { page = 1, limit = 10, status, method, sort = '-initiatedAt' } = options;
  const filter: any = { userId, isDeleted: false };
  
  if (status) filter.status = status;
  if (method) filter.method = method;
  
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .populate('orderId', 'orderNumber totalAmount status')
    .populate('userId', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to find order payments
PaymentSchema.statics.findOrderPayments = function(orderId: string) {
  return this.find({ orderId, isDeleted: false })
    .populate('userId', 'name email phone')
    .sort('-initiatedAt');
};

// Instance method to add refund
PaymentSchema.methods.addRefund = function(refundInfo: Partial<IRefundInfo>) {
  this.refunds.push(refundInfo);
  this.amountRefunded += refundInfo.amount || 0;
  return this.save();
};

// Instance method to mark as completed
PaymentSchema.methods.markCompleted = function(gatewayResponse?: IPaymentGatewayResponse) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Instance method to mark as failed
PaymentSchema.methods.markFailed = function(reason: string, errorCode?: string, errorDescription?: string) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  if (errorCode) this.errorCode = errorCode;
  if (errorDescription) this.errorDescription = errorDescription;
  return this.save();
};

// Virtual for refund status
PaymentSchema.virtual('refundStatus').get(function() {
  if ((this as any).amountRefunded === 0) return 'none';
  if ((this as any).amountRefunded >= (this as any).amount) return 'full';
  return 'partial';
});

// Virtual for amount in rupees (from paisa)
PaymentSchema.virtual('amountInRupees').get(function() {
  return (this as any).amount / 100;
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
