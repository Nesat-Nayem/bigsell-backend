import { Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}