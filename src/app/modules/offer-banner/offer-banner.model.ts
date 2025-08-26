import mongoose, { Schema } from 'mongoose';
import { IOfferBanner } from './offer-banner.interface';

const OfferBannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
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

export const OfferBanner = mongoose.model<IOfferBanner>('OfferBanner', OfferBannerSchema);
