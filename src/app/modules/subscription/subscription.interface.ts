import { Document } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  slug?: string;
  price: number;
  currency?: string; // e.g., INR
  billingCycle?: 'monthly' | 'yearly';
  color?: string; // e.g., secondary | warning | info
  features: string[];
  includeIds?: string[];
  order?: number;
  isActive: boolean;
  isDeleted: boolean;
  metaTitle?: string;
  metaTags?: string[];
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
