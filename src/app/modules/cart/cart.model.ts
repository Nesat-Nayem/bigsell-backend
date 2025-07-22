import mongoose, { Schema } from 'mongoose';
import { ICart, ICartItem } from './cart.interface';

// Cart Item Schema
const CartItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  selectedColor: {
    type: String,
    trim: true,
  },
  selectedSize: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Main Cart Schema
const CartSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [CartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
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
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata' 
        });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata' 
        });
        return ret;
      }
    }
  }
);

// Indexes for better performance
CartSchema.index({ user: 1 });
CartSchema.index({ user: 1, isDeleted: 1 });
CartSchema.index({ createdAt: -1 });

// Virtual for item count
CartSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  } else {
    this.totalItems = 0;
    this.totalPrice = 0;
  }
  next();
});

// Static method to find user's cart
CartSchema.statics.findUserCart = function(userId: string) {
  return this.findOne({ user: userId, isDeleted: false })
    .populate('items.product', 'name price images thumbnail stock colors sizes')
    .populate('user', 'name email');
};

// Instance method to add item to cart
CartSchema.methods.addItem = function(productId: string, quantity: number, price: number, selectedColor?: string, selectedSize?: string) {
  const existingItemIndex = this.items.findIndex(
    (item: any) => 
      item.product.toString() === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedColor,
      selectedSize,
    });
  }

  return this.save();
};

// Instance method to update item quantity
CartSchema.methods.updateItem = function(productId: string, quantity: number, selectedColor?: string, selectedSize?: string) {
  const itemIndex = this.items.findIndex(
    (item: any) => 
      item.product.toString() === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to remove item from cart
CartSchema.methods.removeItem = function(productId: string, selectedColor?: string, selectedSize?: string) {
  this.items = this.items.filter(
    (item: any) => !(
      item.product.toString() === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    )
  );
  
  return this.save();
};

// Instance method to clear cart
CartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
