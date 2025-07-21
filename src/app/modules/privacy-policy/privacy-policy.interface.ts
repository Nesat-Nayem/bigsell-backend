import { Document } from 'mongoose';

export interface IPrivacyPolicy extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
