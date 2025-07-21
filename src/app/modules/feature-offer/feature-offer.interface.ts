import { Document } from 'mongoose';

export interface IFeatureOffer extends Document {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  url: string;
  isActive: boolean;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}