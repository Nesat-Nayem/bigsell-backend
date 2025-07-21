import mongoose, { Schema } from 'mongoose';
import { IPricing } from './pricing.interface';

const PricingSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    
    
    price: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true 
    },
    features: {
      type: [String],
      required: true
    },
    color: {
      type: String,
      required: true,
      trim: true
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
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);