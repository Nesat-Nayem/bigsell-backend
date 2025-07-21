import { Document } from 'mongoose';

export interface IContract extends Document {
  name: string;
  brandName: string;
  phoneNumber: string;
  emailAddress: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
