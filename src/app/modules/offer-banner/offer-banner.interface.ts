import { Document } from 'mongoose';

export interface IOfferBanner extends Document {
  title: string;
  subtitle: string;
  offer: string;
  url: string;
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
