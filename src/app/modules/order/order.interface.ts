import { Document, Types } from 'mongoose';

export interface IOrderItem {
  _id?: Types.ObjectId;
  menuItem: string; // Menu item ID
  hotelId: Types.ObjectId; // Hotel ID
  quantity: number;
  size: string;
  addons: {
    key: string;
    quantity: number;
  }[];
  price: number;
  specialInstructions?: string;
  orderedBy: Types.ObjectId; // User who ordered this item
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  paymentMethod: 'cash' | 'razorpay' | 'manual';
  itemPaymentStatus: 'pending' | 'paid';
}
export interface ICreatedBy {
  id: Types.ObjectId;
  role: 'staff' | 'user' | 'admin';
}

export interface IOrder extends Document {
  users: Types.ObjectId[];
  items: IOrderItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceCharge: number;
  totalAmount: number;
  amountPaid?: number;
  paymentMethod: 'cash' | 'razorpay' | 'manual';
  paymentStatus: 'pending' | 'partially-paid' | 'paid' | 'failed';
  paymentId?: string;
  paymentDetails?: any; // To store Razorpay details or other info
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  tableNumber?: string;
  specialInstructions?: string;
  couponCode?: string;
  discountAmount?: number;
  createdBy?: ICreatedBy;
  createdAt: Date;
  updatedAt: Date;
}

