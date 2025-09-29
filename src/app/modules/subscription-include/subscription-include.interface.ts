import { Document } from 'mongoose';

export interface ISubscriptionInclude extends Document {
  title: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
