import { Document } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
