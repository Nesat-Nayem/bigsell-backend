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
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const HelpSupport = mongoose.model<IHelpSupport>('HelpSupport', HelpSupportSchema);