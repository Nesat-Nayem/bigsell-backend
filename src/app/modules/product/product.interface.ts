import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  sku: string;
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  brand?: string;
  images: string[];
  thumbnail: string;
  stock: number;
  minStock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  features?: string[];
  specifications?: {
    [key: string]: string;
  };
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isDiscount: boolean;
  isWeeklyBestSelling: boolean;
  isWeeklyDiscount: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  vendor?: string;
  shippingInfo?: {
    weight?: number; // kg, used for Delhivery chargeable weight calculation
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isDiscount?: boolean;
  isWeeklyBestSelling?: boolean;
  isWeeklyDiscount?: boolean;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  search?: string;
}

export interface IProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: IProductFilter;
}
