import { Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  couponCode: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usagePerUser: number;
  totalUses: number;
  usedBy: Types.ObjectId[];
  isActive: boolean;
  vendorId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} 


