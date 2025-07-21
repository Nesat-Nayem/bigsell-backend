import { Document } from 'mongoose';

export interface ITermsCondition extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}