import mongoose, { Schema } from 'mongoose';
import { IWishlist, IWishlistItem, IWishlistModel } from './wishlist.interface';

// Wishlist Item Schema
const WishlistItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, { _id: false });

// Main Wishlist Schema
const WishlistSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One wishlist per user
    },
    items: [WishlistItemSchema],
    totalItems: {
      type: Number,
      default: 0,
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
          timeZone: 'Asia/Kolkata',
        });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        });
        return ret;
      }
    }
  }
);

// Indexes for better performance
WishlistSchema.index({ user: 1, isDeleted: 1 });
WishlistSchema.index({ 'items.product': 1 });
WishlistSchema.index({ 'items.addedAt': -1 });

// Pre-save middleware to update totalItems
WishlistSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    (this as any).totalItems = (this as any).items.length;
  }
  next();
});

// Static method to find or create user wishlist
WishlistSchema.statics.findOrCreateUserWishlist = async function(userId: string) {
  let wishlist = await this.findOne({ user: userId, isDeleted: false });
  
  if (!wishlist) {
    wishlist = new this({
      user: userId,
      items: [],
      totalItems: 0,
    });
    await wishlist.save();
  }
  
  return wishlist;
};

// Instance method to add item to wishlist
WishlistSchema.methods.addItem = function(productId: string, notes?: string) {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    if (notes) {
      this.items[existingItemIndex].notes = notes;
    }
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product: productId,
      addedAt: new Date(),
      notes: notes || '',
    });
  }

  (this as any).totalItems = (this as any).items.length;
  return this.save();
};

// Instance method to remove item from wishlist
WishlistSchema.methods.removeItem = function(productId: string) {
  this.items = this.items.filter(
    (item: any) => item.product.toString() !== productId
  );
  (this as any).totalItems = (this as any).items.length;
  return this.save();
};

// Instance method to clear wishlist
WishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  (this as any).totalItems = 0;
  return this.save();
};

// Instance method to check if item exists in wishlist
WishlistSchema.methods.hasItem = function(productId: string): boolean {
  return this.items.some(
    (item: any) => item.product.toString() === productId
  );
};

// Instance method to update item notes
WishlistSchema.methods.updateItemNotes = function(productId: string, notes: string) {
  const itemIndex = this.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex !== -1) {
    this.items[itemIndex].notes = notes;
    return this.save();
  } else {
    throw new Error('Item not found in wishlist');
  }
};

// Virtual for recent items (added in last 7 days)
WishlistSchema.virtual('recentItems').get(function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return (this as any).items.filter((item: any) => item.addedAt >= sevenDaysAgo);
});

// Virtual for items count by category (requires population)
WishlistSchema.virtual('itemsByCategory').get(function() {
  const categoryMap = new Map();
  
  (this as any).items.forEach((item: any) => {
    if (item.product && item.product.category) {
      const categoryId = item.product.category._id || item.product.category;
      const categoryName = item.product.category.name || 'Unknown';
      
      if (categoryMap.has(categoryId.toString())) {
        categoryMap.get(categoryId.toString()).count++;
      } else {
        categoryMap.set(categoryId.toString(), {
          categoryId: categoryId.toString(),
          categoryName,
          count: 1,
        });
      }
    }
  });
  
  return Array.from(categoryMap.values());
});

export const Wishlist = mongoose.model<IWishlist, IWishlistModel>('Wishlist', WishlistSchema);
