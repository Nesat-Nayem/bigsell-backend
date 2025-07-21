import mongoose, { Schema } from 'mongoose';
import { IMustTry } from './musttry.interface';

const MustTrySchema: Schema = new Schema(
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
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const MustTry = mongoose.model<IMustTry>('MustTry', MustTrySchema);