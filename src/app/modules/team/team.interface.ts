import { Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  designation: string;
  image: string;
  status: 'Active' | 'Inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
