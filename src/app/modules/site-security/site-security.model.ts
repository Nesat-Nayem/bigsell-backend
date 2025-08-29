import mongoose, { Schema } from 'mongoose';
import { ISiteSecurity } from './site-security.interface';

const SiteSecuritySchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      default: '<p>Site Security content goes here.</p>'
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

export const SiteSecurity = mongoose.model<ISiteSecurity>('SiteSecurity', SiteSecuritySchema);
