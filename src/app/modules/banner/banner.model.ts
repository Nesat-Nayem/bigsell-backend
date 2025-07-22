import mongoose, { Schema } from 'mongoose';
import { IBanner } from './banner.interface';

const BannerSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    image: { 
      type: String, 
      required: true 
    },
    
    
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
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

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
