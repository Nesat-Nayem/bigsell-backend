import { Document } from 'mongoose';

export interface IPricing extends Document {
  title: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

