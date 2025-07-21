import mongoose, { Schema } from 'mongoose';
import { ICoupon } from './coupon.interface';

const CouponSchema: Schema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    
    maxDiscountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usagePerUser: {
        type: Number,
        default: 1
    },
    totalUses: {
      type: Number,
      default: 0,
    },
    usedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CouponSchema.index({ vendorId: 1, couponCode: 1 }, { unique: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema); 