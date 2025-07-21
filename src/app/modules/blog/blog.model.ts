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
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);