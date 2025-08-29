import { Document } from 'mongoose';

export interface IVendorPolicy extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
