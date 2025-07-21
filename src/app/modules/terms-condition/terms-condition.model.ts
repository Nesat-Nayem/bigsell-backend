import mongoose, { Schema } from 'mongoose';
import { ITermsCondition } from './terms-condition.interface';

const TermsConditionSchema: Schema = new Schema(
  {
    content: { 
      type: String, 
      required: true,
      default: '<p>Privacy Policy content goes here.</p>'
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

export const TermsCondition = mongoose.model<ITermsCondition>('TermsCondition', TermsConditionSchema);