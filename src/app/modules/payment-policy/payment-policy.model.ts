import mongoose, { Schema } from 'mongoose';
import { IPaymentPolicy } from './payment-policy.interface';

const PaymentPolicySchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      default: '<p>Payment Policy content goes here.</p>'
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

export const PaymentPolicy = mongoose.model<IPaymentPolicy>('PaymentPolicy', PaymentPolicySchema);
