import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';

const OrderItemSchema = new Schema({
  
  menuItem: {
    type: String,
    required: true
  },
  hotelId: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  size: {
    type: String,
    required: true
  },
  addons: [{
    key: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  price: {
    type: Number,
    required: true
  },
  specialInstructions: {
    type: String,
    default: ""
  },
  orderedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'razorpay', 'manual'],
    required: true
  },
  itemPaymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
  }
}, { _id: true });

const CreatedBySchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  role: {
    type: String,
    enum: ['staff', 'user', 'admin'],
    required: true
  }
}, { _id: false });

const OrderSchema: Schema = new Schema(
  {
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    cgstAmount: {
      type: Number,
      required: true
    },
    sgstAmount: {
      type: Number,
      required: true
    },
    serviceCharge: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
      default: {}
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'razorpay', 'manual'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially-paid', 'paid', 'failed'],
      default: 'pending'
    },
    tableNumber: {
      type: String,
      trim: true,
      default: null,
    },
    paymentId: {
      type: String
    },
    couponCode: {
      type: String,
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: CreatedBySchema,
      default: null
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
