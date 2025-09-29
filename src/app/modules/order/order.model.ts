import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, IShippingAddress, IPaymentInfo, IOrderStatusHistory } from './order.interface';

// Order Item Schema
const OrderItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  selectedColor: {
    type: String,
    trim: true,
  },
  selectedSize: {
    type: String,
    trim: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

// Shipping Address Schema
const ShippingAddressSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Bangladesh',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Payment Info Schema
const PaymentInfoSchema: Schema = new Schema({
  method: {
    type: String,
    enum: ['card', 'cash_on_delivery', 'bank_transfer', 'digital_wallet'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
  },
  paymentDate: {
    type: Date,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

// Order Status History Schema
const OrderStatusHistorySchema: Schema = new Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

// Main Order Schema
const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: function() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    
    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Order Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    
    // Addresses
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    billingAddress: {
      type: ShippingAddressSchema,
    },
    
    // Payment
    paymentInfo: {
      type: PaymentInfoSchema,
      required: true,
    },
    
    // Shipping
    shippingMethod: {
      type: String,
      required: true,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    
    // Order Management
    statusHistory: [OrderStatusHistorySchema],
    notes: {
      type: String,
      trim: true,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    returnReason: {
      type: String,
      trim: true,
    },
    
    // Timestamps
    orderDate: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
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
        if ((ret as any).orderDate) {
          (ret as any).orderDate = new Date((ret as any).orderDate).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata' 
          });
        }
        return ret;
      }
    }
  }
);

// Indexes for better performance
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ user: 1, isDeleted: 1 });

// Generate timestamps and status history updates
OrderSchema.pre('save', async function(next) {
  // Add status to history if status changed
  if (this.isModified('status') && !this.isNew) {
    (this as any).statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`,
    });
  }
  
  // Set timestamp based on status
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'shipped':
        if (!this.shippedAt) this.shippedAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  next();
});

// Static method to find user's orders
OrderSchema.statics.findUserOrders = function(userId: string, options: any = {}) {
  const { page = 1, limit = 10, status, sort = '-orderDate' } = options;
  const filter: any = { user: userId, isDeleted: false };
  
  if (status) {
    filter.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .populate('user', 'name email phone')
    .populate('items.product', 'name price images thumbnail')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Instance method to calculate totals
OrderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total: number, item: any) => total + item.subtotal, 0);
  this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this;
};

// Instance method to update status
OrderSchema.methods.updateStatus = function(newStatus: string, note?: string, updatedBy?: string) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${newStatus}`,
    updatedBy: updatedBy,
  });
  return this.save();
};

// Instance method to cancel order
OrderSchema.methods.cancelOrder = function(reason: string, cancelledBy?: string) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledAt = new Date();
  this.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled: ${reason}`,
    updatedBy: cancelledBy,
  });
  return this.save();
};

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
