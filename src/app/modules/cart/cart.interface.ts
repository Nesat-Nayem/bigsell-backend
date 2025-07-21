import { Document, Types } from "mongoose";

export interface ICartItem {
  _id?: Types.ObjectId;
  // Change from product to menuItem and hotelId
  menuItem: string; // This will store the menu item ID
  hotelId: Types.ObjectId; // Add hotel ID to reference the correct hotel
  quantity: number;
  size: string;
  addons: {
    key: string;
    quantity: number;
  }[];
  
  price: number; // Price after calculating size and addons
  specialInstructions?: string; // Optional field for special instructions
  orderedBy?: Types.ObjectId; // User who ordered this item
}

export interface ICart extends Document {
  user?: Types.ObjectId; // Make optional for shared carts
  users?: Types.ObjectId[]; // For shared carts
  tableIdentifier?: string; // For shared carts e.g., `hotelId_tableNumber`
  items: ICartItem[];
  totalAmount: number;
  appliedCouponCode?: string;
  discountAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}


