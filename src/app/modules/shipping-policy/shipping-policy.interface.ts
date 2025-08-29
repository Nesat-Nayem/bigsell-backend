import { Document } from 'mongoose';

export interface IShippingPolicy extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
