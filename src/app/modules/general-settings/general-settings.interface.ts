import { Document } from 'mongoose';

export interface IGeneralSettings extends Document {
  number?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  twitter?: string;
  youtube?: string;
  favicon?: string; // URL
  logo?: string; // URL
  headerTab?: string;
  address?: string;
  iframe?: string;
  freeShippingThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}
