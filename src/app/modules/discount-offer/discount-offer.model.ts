import mongoose, { Schema } from 'mongoose';
import { IDiscountOffer } from './discount-offer.interface';

const DiscountOfferSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      },
    },
  }
);

export const DiscountOffer = mongoose.model<IDiscountOffer>('DiscountOffer', DiscountOfferSchema);
