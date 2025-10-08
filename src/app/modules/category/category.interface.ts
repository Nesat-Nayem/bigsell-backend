import { Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  image: string;
  productCategory: string; // ref ProductCategory (required)
  productSubcategory?: string | null; // ref ProductCategory (optional)
  productSubSubcategory?: string | null; // ref ProductCategory (optional)
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
