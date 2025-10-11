import mongoose, { Schema } from 'mongoose';

export interface ICoupon extends mongoose.Document {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive';
  vendor?: mongoose.Types.ObjectId | null;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    minOrderAmount: { type: Number, min: 0, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        return ret;
      },
    },
  }
);

CouponSchema.pre('save', function (next) {
  if ((this as any).code) {
    (this as any).code = String((this as any).code).trim().toUpperCase();
  }
  if ((this as any).startDate && (this as any).endDate) {
    if (new Date((this as any).startDate) > new Date((this as any).endDate)) {
      return next(new Error('startDate cannot be after endDate'));
    }
  }
  next();
});

CouponSchema.index({ code: 1 }, { unique: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
