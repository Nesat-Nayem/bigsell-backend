import mongoose, { Schema } from "mongoose";
import {
  ICategory,
  ICategoryAttribute,
  ICategoryModel,
} from "./product-category.interface";

// Schema for dynamic attributes
const AttributeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    defaultValue: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

const CategorySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    icon: {
      type: String, // For category icons (FontAwesome, material icons, etc.)
    },

    // Hierarchical structure
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 2, // Maximum depth of 2 levels (0=root, 1=sub, 2=sub-sub)
    },
    path: {
      type: String,
      required: false,
      index: true,
    },

    // Dynamic attributes
    attributes: [AttributeSchema],

    // Category settings
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },

    // SEO fields
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

    // Metadata
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
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
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for performance
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isActive: 1, isDeleted: 1 });
// Optimized compound index for getCategoryTree filtering and sorting
CategorySchema.index({ parentId: 1, isDeleted: 1, isActive: 1, displayOrder: 1, title: 1 });

// Virtual for children
CategorySchema.virtual("children", {
  ref: "ProductCategory",
  localField: "_id",
  foreignField: "parentId",
  match: { isDeleted: false },
});

// Virtual for parent
CategorySchema.virtual("parent", {
  ref: "ProductCategory",
  localField: "parentId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for full path with titles
CategorySchema.virtual("fullPath").get(function (this: ICategory) {
  return this.path ? this.path.split("/").join(" > ") : this.title || "";
});

// Pre-save middleware to generate slug and path
CategorySchema.pre("save", async function (this: ICategory, next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Ensure slug is unique
  if (this.isModified("slug") || this.isNew) {
    const baseSlug = this.slug;
    let counter = 1;
    let finalSlug = baseSlug;

    while (
      await mongoose.models.ProductCategory.findOne({
        slug: finalSlug,
        _id: { $ne: this._id },
        isDeleted: false,
      })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = finalSlug;
  }

  // Generate path
  if (this.parentId) {
    const parent = await mongoose.models.ProductCategory.findById(this.parentId);
    if (parent) {
      this.level = parent.level + 1;
      this.path = `${parent.path}/${this.slug}`;
    }
  } else {
    this.level = 0;
    this.path = this.slug;
  }

  next();
});

// Method to get category tree
CategorySchema.statics.getCategoryTree = async function (
  parentId = null,
  maxDepth = 3
) {
  const categories = await this.find({
    parentId,
    isDeleted: false,
    isActive: true,
  }).sort({ displayOrder: 1, title: 1 });

  if (maxDepth <= 0) return categories;

  // Note: Recursive call removed due to TypeScript issues
  // Tree building is handled in the controller
  return categories;
};

// Method to get all descendants
CategorySchema.methods.getDescendants = async function (this: ICategory) {
  if (!this.path) return [];
  
  return await mongoose.models.ProductCategory.find({
    path: new RegExp(`^${this.path}/`),
    isDeleted: false,
  }).sort({ path: 1 });
};

// Method to get ancestors
CategorySchema.methods.getAncestors = async function (this: ICategory) {
  if (!this.path) return [];
  
  const pathParts = this.path.split("/");
  const ancestorPaths = [];

  for (let i = 1; i < pathParts.length; i++) {
    ancestorPaths.push(pathParts.slice(0, i).join("/"));
  }

  
  return await mongoose.models.ProductCategory.find({
    path: { $in: ancestorPaths },
    isDeleted: false,
  }).sort({ level: 1 });
};

export const ProductCategory = mongoose.model<ICategory, ICategoryModel>(
  "ProductCategory",
  CategorySchema
);
