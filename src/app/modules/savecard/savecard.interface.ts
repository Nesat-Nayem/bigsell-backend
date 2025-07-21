import { Document } from 'mongoose';

export interface ISaveCard extends Document {
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
