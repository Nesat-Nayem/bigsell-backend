import mongoose, { Schema } from "mongoose";
import { ICategory } from "./category.interface";

const CategorySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    // Link to Product Categories
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    productSubcategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    productSubSubcategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).createdAt = new Date(
          (ret as any).createdAt
        ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        (ret as any).updatedAt = new Date(
          (ret as any).updatedAt
        ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        return ret;
      },
    },
  }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
