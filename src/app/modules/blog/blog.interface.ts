import { Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  status: 'Active' | 'Inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}