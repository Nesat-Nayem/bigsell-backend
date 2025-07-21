import { Document } from 'mongoose';

export interface IOffer extends Document {
  image: string;
  isActive: boolean;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}