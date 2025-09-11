import { Document, Types } from 'mongoose';

// Order Item Interface
export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  thumbnail: string;
  subtotal: number;
}

// Shipping Address Interface
export interface IShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Payment Information Interface
export interface IPaymentInfo {
  method: 'card' | 'cash_on_delivery' | 'bank_transfer' | 'digital_wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate?: Date;
  amount: number;
}

// Order Status History Interface
export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: Types.ObjectId;
}

// Main Order Interface
export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  
  // Order Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Addresses and Contact
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  
  // Payment
  paymentInfo: IPaymentInfo;
  
  // Shipping
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  
  // Order Management
  statusHistory: IOrderStatusHistory[];
  notes?: string;
  cancelReason?: string;
  returnReason?: string;
  
  // Timestamps
  orderDate: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Query Filters
export interface IOrderFilter {
  user?: string;
  status?: string;
  paymentStatus?: string;
  orderNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isDeleted?: boolean;
}

// Create Order Request
export interface ICreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  paymentMethod: 'card' | 'cash_on_delivery' | 'bank_transfer' | 'digital_wallet';
  // Optional: Only admins can set user different from themselves 
  user?: string;
  shippingMethod: string;
  notes?: string;
  couponCode?: string;
}

// Update Order Status Request
export interface IUpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// Order Summary
export interface IOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}
