import mongoose, { Schema } from 'mongoose';
import { IContract } from './contract.interface';

const ContractSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    brandName: { 
      type: String, 
      required: true,
      trim: true
    },
    phoneNumber: { 
      type: String, 
      required: true,
      trim: true
    },
    emailAddress: { 
      type: String, 
      required: true,
      trim: true
    },
    message: { 
      type: String, 
      required: true,
      trim: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true
  }
);

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
