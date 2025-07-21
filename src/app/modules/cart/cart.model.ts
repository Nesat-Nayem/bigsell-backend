import mongoose, { Schema } from 'mongoose';
import { ICart } from './cart.interface';

const CartItemSchema = new Schema({
  // Change from product to menuItem and hotelId
  menuItem: {
    type: String, // Menu item ID is a string
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
    ref: 'User'
  }
}, { _id: true });


const CartSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    tableIdentifier: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    },
    appliedCouponCode: {
      type: String,
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);


export const Cart = mongoose.model<ICart>('Cart', CartSchema);
