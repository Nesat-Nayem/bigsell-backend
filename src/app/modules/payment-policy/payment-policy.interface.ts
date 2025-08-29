import { Document } from 'mongoose';

export interface IPaymentPolicy extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
