import { Document } from 'mongoose';

export interface IDiscountOffer extends Document {
  title: string;
  offer: string;
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
