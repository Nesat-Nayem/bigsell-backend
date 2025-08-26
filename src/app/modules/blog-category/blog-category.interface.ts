import { Document } from 'mongoose';

export interface IBlogCategory extends Document {
  categoryName: string;
  status: 'Active' | 'Inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
