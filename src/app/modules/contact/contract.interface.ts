import { Document } from 'mongoose';

export interface IContract extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
