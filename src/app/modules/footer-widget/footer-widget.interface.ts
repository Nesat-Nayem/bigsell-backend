import { Document } from 'mongoose';

export interface IFooterWidget extends Document {
  title: string;
  subtitle: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
