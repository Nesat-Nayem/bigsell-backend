import mongoose, { Schema } from 'mongoose';
import { IHelpSupport } from './help-support.interface';

const HelpSupportSchema: Schema = new Schema(
  {
    content: { 
      type: String, 
      required: true,
      default: '<p>Help and Support content goes here.</p>'
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

export const HelpSupport = mongoose.model<IHelpSupport>('HelpSupport', HelpSupportSchema);