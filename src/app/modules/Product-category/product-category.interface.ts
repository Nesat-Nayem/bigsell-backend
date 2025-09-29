import { Document, Types, Model } from "mongoose";

// Interface for dynamic attributes (size, color, etc.)
export interface ICategoryAttribute {
  name: string; // e.g., 'size', 'color', 'material'
  type: "text" | "select" | "multiselect" | "number" | "boolean";
  required: boolean;
  options?: string[]; // For select/multiselect types
  defaultValue?: string | number | boolean;
}

// Main category interface
export interface ICategory extends Document {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string; // For category icons

  // Hierarchical structure
  parentId?: Types.ObjectId | null; // null for root categories
  level: number; // 0 = root, 1 = subcategory, 2 = sub-subcategory
  path: string; // e.g., "fashion/topwear/tshirts"

  // Dynamic attributes for products in this category
  attributes: ICategoryAttribute[];

  // Category settings
  isActive: boolean;
  displayOrder: number; // For sorting
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Metadata
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  children?: ICategory[];
  parent?: ICategory;
  fullPath?: string;
}

// Static methods interface
export interface ICategoryModel extends Model<ICategory> {
  getCategoryTree(
    parentId?: Types.ObjectId | null,
    maxDepth?: number
  ): Promise<ICategory[]>;
}

// DTO interfaces
export interface ICreateCategoryDto {
  title: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  image?: string | null;
  attributes?: ICategoryAttribute[];
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface IUpdateCategoryDto {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  attributes?: ICategoryAttribute[];
  displayOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}
