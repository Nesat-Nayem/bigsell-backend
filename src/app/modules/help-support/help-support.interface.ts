import { Document } from 'mongoose';

export interface IHelpSupport extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}