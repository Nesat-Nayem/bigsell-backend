import mongoose, { Schema } from 'mongoose';
import { IShippingPolicy } from './shipping-policy.interface';

const ShippingPolicySchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      default: '<p>Shipping Policy content goes here.</p>'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const ShippingPolicy = mongoose.model<IShippingPolicy>('ShippingPolicy', ShippingPolicySchema);
