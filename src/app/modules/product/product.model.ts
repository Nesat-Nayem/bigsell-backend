import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.interface";

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
     
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
      index: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: false,
      index: true,
    },
    subSubcategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: false,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    thumbnail: {
      type: String,
      required: true,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStock: {
      type: Number,
      min: 0,
      default: 5,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "discontinued"],
      default: "active",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDiscount: {
      type: Boolean,
      default: false,
      index: true,
    },
    isWeeklyBestSelling: {
      type: Boolean,
      default: false,
      index: true,
    },
    isWeeklyDiscount: {
      type: Boolean,
      default: false,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    shippingInfo: {
      weight: { type: Number, min: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

// Indexes for better query performance
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ price: 1, category: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1, reviewCount: -1 });

// Virtual for calculating final price after discount
ProductSchema.virtual("finalPrice").get(function () {
  if ((this as any).discount > 0) {
    if ((this as any).discountType === "percentage") {
      return (
        (this as any).price -
        ((this as any).price * (this as any).discount) / 100
      );
    } else {
      return Math.max(0, (this as any).price - (this as any).discount);
    }
  }
  return (this as any).price;
});

// Virtual for stock status
ProductSchema.virtual("stockStatus").get(function () {
  if ((this as any).stock === 0) return "out_of_stock";
  if ((this as any).stock <= (this as any).minStock) return "low_stock";
  else if ((this as any).stock > 0 && (this as any).status === "out_of_stock")
    return "in_stock";
  return "in_stock";
});

// Pre-save middleware to update status based on stock
ProductSchema.pre("save", function (next) {
  if ((this as any).stock === 0 && (this as any).status === "active") {
    (this as any).status = "out_of_stock";
  } else if (
    (this as any).stock > 0 &&
    (this as any).status === "out_of_stock"
  ) {
    (this as any).status = "active";
  }
  next();
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
