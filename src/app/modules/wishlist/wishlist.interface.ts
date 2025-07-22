import { Document, Types, Model } from 'mongoose';

// Wishlist Item Interface
export interface IWishlistItem {
  product: Types.ObjectId;
  addedAt: Date;
  notes?: string;
}

// Main Wishlist Interface
export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
  totalItems: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance Methods
  addItem(productId: string, notes?: string): Promise<IWishlist>;
  removeItem(productId: string): Promise<IWishlist>;
  clearWishlist(): Promise<IWishlist>;
  hasItem(productId: string): boolean;
  updateItemNotes(productId: string, notes: string): Promise<IWishlist>;
}

// Wishlist Model Interface
export interface IWishlistModel extends Model<IWishlist> {
  findOrCreateUserWishlist(userId: string): Promise<IWishlist>;
}

// Wishlist Query Filters
export interface IWishlistFilter {
  user?: string;
  isDeleted?: boolean;
}

// Add to Wishlist Request
export interface IAddToWishlistRequest {
  productId: string;
  notes?: string;
}

// Update Wishlist Item Request
export interface IUpdateWishlistItemRequest {
  notes?: string;
}

// Wishlist Summary
export interface IWishlistSummary {
  totalItems: number;
  recentlyAdded: number; // Items added in last 7 days
  categories: {
    categoryId: string;
    categoryName: string;
    itemCount: number;
  }[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}
