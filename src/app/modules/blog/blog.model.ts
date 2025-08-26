import mongoose, { Schema } from 'mongoose';
import { IBlog } from './blog.interface';

const BlogSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    shortDesc: {
      type: String,
      required: true,
      trim: true
    },
    longDesc: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    isDeleted: {
      type: Boolean,
      default: false
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

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);