import mongoose, { Schema } from 'mongoose';
import { IFAQ } from './faq.interface';

const FAQSchema: Schema = new Schema(
  {
    question: { 
      type: String, 
      required: true,
      trim: true
    },
    answer: { 
      type: String, 
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
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

export const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);