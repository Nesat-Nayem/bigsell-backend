import { Document } from 'mongoose';

export interface ITable extends Document {
  tableNumber: number;
  isActive: boolean;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
