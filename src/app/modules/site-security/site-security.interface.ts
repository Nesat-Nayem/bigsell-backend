import { Document } from 'mongoose';

export interface ISiteSecurity extends Document {
  content: string;
  updatedAt: Date;
  createdAt: Date;
}
