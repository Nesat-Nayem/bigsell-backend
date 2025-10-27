import mongoose, { Schema } from 'mongoose';
import { IGeneralSettings } from './general-settings.interface';

const GeneralSettingsSchema: Schema = new Schema(
  {
    number: { type: String, trim: true },
    email: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    favicon: { type: String, trim: true },
    logo: { type: String, trim: true },
    headerTab: { type: String, trim: true },
    address: { type: String, trim: true },
    iframe: { type: String, trim: true },
    freeShippingThreshold: { type: Number, default: 0 },
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

export const GeneralSettings = mongoose.model<IGeneralSettings>('GeneralSettings', GeneralSettingsSchema);
