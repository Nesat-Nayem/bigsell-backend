import mongoose, { Schema } from 'mongoose';
import { ITable } from './table.interface';

const TableSchema: Schema = new Schema(
  {
    tableNumber: { 
      type: Number, 
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
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

export const Table = mongoose.model<ITable>('Table', TableSchema);
