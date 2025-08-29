import { Document } from 'mongoose';

export interface IDisclaimer extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
