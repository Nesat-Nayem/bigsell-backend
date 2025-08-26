import { Document } from 'mongoose';

export interface IHeaderBanner extends Document {
  title: string;
  image: string;
  isActive: boolean;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
