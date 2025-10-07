import { NextFunction, Request, Response } from "express";
import { ProductCategory as Category } from "./product-category.model";
import {
  categoryValidation,
  categoryUpdateValidation,
  categoryTemplateValidation,
} from "./product-category.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";
import {
  ICreateCategoryDto,
  IUpdateCategoryDto,
  ICategoryAttribute,
} from "./product-category.interface";
import mongoose from "mongoose";

const isRootAlias = (val?: string | null) =>
  val === null ||
  val === undefined ||
  val === "null" ||
  val === "root" ||
  val === "ROOT";

const parseParentId = (val?: string | null): mongoose.Types.ObjectId | null => {
  if (isRootAlias(val)) return null;
  if (!val || !mongoose.Types.ObjectId.isValid(val)) {
    throw new Error(`Invalid ObjectId: ${val}`);
  }
  return new mongoose.Types.ObjectId(val);
};

// Predefined category templates with default attributes
const CATEGORY_TEMPLATES = {
  fashion: {
    title: "Fashion",
    description: "Clothing, accessories, and fashion items",
    icon: "fas fa-tshirt",
    attributes: [
      {
        name: "size",
        type: "select" as const,
        required: true,
        options: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      {
        name: "color",
        type: "select" as const,
        required: true,
        options: [
          "Red",
          "Blue",
          "Green",
          "Black",
          "White",
          "Yellow",
          "Pink",
          "Purple",
        ],
      },
      {
        name: "material",
        type: "select" as const,
        required: false,
        options: ["Cotton", "Polyester", "Wool", "Silk", "Denim", "Leather"],
      },
      { name: "brand", type: "text" as const, required: false },
      {
        name: "gender",
        type: "select" as const,
        required: false,
        options: ["Male", "Female", "Unisex"],
      },
    ],
  },
  electronics: {
    title: "Electronics",
    description: "Electronic devices and gadgets",
    icon: "fas fa-laptop",
    attributes: [
      { name: "brand", type: "text" as const, required: true },
      { name: "model", type: "text" as const, required: false },
      {
        name: "color",
        type: "select" as const,
        required: false,
        options: ["Black", "White", "Silver", "Gold", "Blue", "Red"],
      },
      {
        name: "warranty",
        type: "select" as const,
        required: false,
        options: ["6 months", "1 year", "2 years", "3 years"],
      },
      { name: "power_rating", type: "text" as const, required: false },
    ],
  },
  furniture: {
    title: "Furniture",
    description: "Home and office furniture",
    icon: "fas fa-chair",
    attributes: [
      {
        name: "material",
        type: "select" as const,
        required: true,
        options: ["Wood", "Metal", "Plastic", "Glass", "Fabric"],
      },
      {
        name: "color",
        type: "select" as const,
        required: true,
        options: ["Brown", "Black", "White", "Natural", "Gray"],
      },
      { name: "dimensions", type: "text" as const, required: false },
      { name: "weight", type: "number" as const, required: false },
      { name: "assembly_required", type: "boolean" as const, required: false },
    ],
  },
  mobile: {
    title: "Mobile & Accessories",
    description:
      "Smartphones, feature phones, tablets, smartwatches and accessories",
    icon: "fas fa-mobile-alt",
    attributes: [
      { name: "brand", type: "text" as const, required: true },
      { name: "model", type: "text" as const, required: false },
      {
        name: "storage",
        type: "select" as const,
        required: true,
        options: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
      },
      {
        name: "ram",
        type: "select" as const,
        required: false,
        options: ["1GB", "2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"],
      },
      {
        name: "color",
        type: "select" as const,
        required: false,
        options: ["Black", "White", "Silver", "Gold", "Blue", "Red", "Green"],
      },
      { name: "battery_capacity", type: "text" as const, required: false }, // e.g. "5000mAh"
      {
        name: "network",
        type: "select" as const,
        required: false,
        options: ["2G", "3G", "4G", "4G LTE", "5G"],
      },
      {
        name: "operating_system",
        type: "select" as const,
        required: false,
        options: ["Android", "iOS", "Other"],
      },
      { name: "camera_spec", type: "text" as const, required: false }, // e.g. "48MP + 8MP"
      {
        name: "warranty",
        type: "select" as const,
        required: false,
        options: ["No Warranty", "6 months", "1 year", "2 years"],
      },
      { name: "accessories_included", type: "text" as const, required: false }, // e.g. "Charger, Earphones, Case"
    ],
  },
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      parentId,
      attributes,
      displayOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
      icon,
    } = req.body;

    // Parse attributes if it's a string
    let parsedAttributes: any[] = [];
    if (attributes) {
      try {
        parsedAttributes =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (err) {
        return next(new appError("Invalid attributes format", 400));
      }
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findOne({
        _id: parentId,
        isDeleted: false,
        isActive: true,
      });

      if (!parentCategory) {
        return next(new appError("Parent category not found", 404));
      }

      // Enforce max depth of 2 (0=root, 1=sub, 2=sub-sub)
      if ((parentCategory.level || 0) >= 2) {
        return next(new appError("Maximum category depth is 2", 400));
      }
    }

    // Check if category with same title already exists in the same level
    const existingCategory = await Category.findOne({
      title,
      parentId: parentId || null,
      isDeleted: false,
    });

    if (existingCategory) {
      return next(
        new appError(
          "Category with this title already exists at this level",
          400
        )
      );
    }

    // Get the image URL from req.file if uploaded, or from body (pre-uploaded)
    let image: string | null = req.file?.path || null;
    if (!image && typeof req.body.image === "string" && req.body.image.trim() !== "") {
      image = req.body.image.trim();
    }

    // Prepare category data
    const categoryData: ICreateCategoryDto = {
      title,
      description,
      parentId: parentId || null, // root category if no parentId
      icon,
      attributes: parsedAttributes,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords
        ? typeof seoKeywords === "string"
          ? JSON.parse(seoKeywords)
          : seoKeywords
        : [],
      // persist image if available
      image: image || undefined,
    };

    // Validate the input (zod/joi schema)
    const validatedData = categoryValidation.parse(categoryData);

    // Create a new category
    const category = new Category(validatedData);
    await category.save();

    // Populate parent information for response
    if (parentId) {
      await category.populate("parent");
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product Category created successfully",
      data: category,
    });
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }
    next(error);
  }
};

// Get all categories
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Category.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(total / limit);

    // Get categories with pagination
    const categories = await Category.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (categories.length === 0) {
      next(new appError("No categories found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};
// Get category by ID
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idRaw = req.params.id;
    // if (!idRaw || !mongoose.Types.ObjectId.isValid(idRaw)) {
    //   return next(new appError(`Invalid category id: ${idRaw}`, 400));
    // }

    const category = await Category.findOne({
      _id: new mongoose.Types.ObjectId(idRaw),
      isDeleted: false,
    });

    if (!category) {
      return next(new appError("Category not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully",
      data: category,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update category by ID
export const updateCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.params.id;
    // Find the category to update
    const category = await Category.findOne({
      _id: categoryId,
      isDeleted: false,
    });

    if (!category) {
      next(new appError("Category not found", 404));
      return;
    }

    // Capture old path/level for descendant updates
    const oldPath = category.path;
    const oldLevel = category.level || 0;

    const body = req.body as any;

    // Title and uniqueness at same level (or global uniqueness depending on your rules)
    if (body.title && body.title !== category.title) {
      const existingCategory = await Category.findOne({
        title: body.title,
        isDeleted: false,
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        next(new appError("Category with this title already exists", 400));
        return;
      }
      category.title = body.title;
    }

    // Description, icon, displayOrder
    if (body.description !== undefined) category.description = body.description;
    if (body.icon !== undefined) category.icon = body.icon;
    if (body.displayOrder !== undefined) {
      const d = typeof body.displayOrder === "string" ? parseInt(body.displayOrder, 10) : body.displayOrder;
      category.displayOrder = isNaN(d) ? 0 : d;
    }

    // SEO fields
    if (body.seoTitle !== undefined) category.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) category.seoDescription = body.seoDescription;
    if (body.seoKeywords !== undefined) {
      try {
        const kws = typeof body.seoKeywords === "string" ? JSON.parse(body.seoKeywords) : body.seoKeywords;
        if (Array.isArray(kws)) category.seoKeywords = kws;
      } catch {
        // ignore invalid format
      }
    }

    // Attributes
    if (body.attributes !== undefined) {
      try {
        const attrs = typeof body.attributes === "string" ? JSON.parse(body.attributes) : body.attributes;
        if (Array.isArray(attrs)) category.attributes = attrs;
      } catch (e) {
        return next(new appError("Invalid attributes format", 400));
      }
    }

    // Parent reassignment
    if (body.parentId !== undefined) {
      const val = body.parentId;
      let newParent: any = null;
      if (!isRootAlias(val)) {
        if (!mongoose.Types.ObjectId.isValid(val)) {
          return next(new appError(`Invalid parentId: ${val}`, 400));
        }
        newParent = await Category.findOne({ _id: val, isDeleted: false });
        if (!newParent) return next(new appError("Parent category not found", 404));
        if (newParent._id.equals(category._id))
          return next(new appError("Category cannot be its own parent", 400));
        // ensure no cycles by preventing setting a descendant as parent
        const descendants = await (category as any).getDescendants();
        if (descendants.some((d: any) => d._id.equals(newParent._id))) {
          return next(new appError("Cannot set a descendant as parent", 400));
        }

        // Enforce max depth: new level cannot exceed 2
        const prospectiveLevel = (newParent.level || 0) + 1;
        if (prospectiveLevel > 2) {
          return next(new appError("Maximum category depth is 2", 400));
        }

        // Ensure descendants will not exceed depth 2 after this move
        const delta = prospectiveLevel - (category.level || 0);
        if (delta > 0 && category.path) {
          const deepestDescendant = await Category.findOne({
            path: new RegExp(`^${category.path}/`),
            isDeleted: false,
          })
            .sort({ level: -1 })
            .lean();
          const deepestLevel = (deepestDescendant?.level as number) || category.level || 0;
          if (deepestLevel + delta > 2) {
            return next(new appError("Re-parenting would exceed maximum depth (2) for one or more descendants", 400));
          }
        }
      }
      category.parentId = newParent ? new mongoose.Types.ObjectId(newParent._id) : null;
    }

    // Image: from file or from body URL
    const oldImage = category.image as string | undefined;
    if (req.file?.path) {
      category.image = req.file.path;
    } else if (typeof body.image === "string" && body.image.trim() !== "") {
      category.image = body.image.trim();
    }

    // Validate selected fields using update validation (build minimal object)
    const toValidate: any = {};
    if (category.title !== undefined) toValidate.title = category.title;
    if (category.description !== undefined) toValidate.description = category.description;
    if (category.icon !== undefined) toValidate.icon = category.icon;
    if (category.displayOrder !== undefined) toValidate.displayOrder = category.displayOrder as any;
    if (category.seoTitle !== undefined) toValidate.seoTitle = category.seoTitle;
    if (category.seoDescription !== undefined) toValidate.seoDescription = category.seoDescription;
    if (category.seoKeywords !== undefined) toValidate.seoKeywords = category.seoKeywords;
    if (category.attributes !== undefined) toValidate.attributes = category.attributes;
    if (category.parentId === null) toValidate.parentId = null;
    if (category.image !== undefined) toValidate.image = category.image;
    if (category.isActive !== undefined) toValidate.isActive = category.isActive;

    // Throws if invalid
    categoryUpdateValidation.parse(toValidate);

    // Save to trigger pre-save hooks (slug/path/level)
    await category.save();

    // If a new file was uploaded and there was an existing image, delete the old image from cloudinary
    if (req.file?.path && oldImage) {
      const publicId = oldImage.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }

    // If the path has changed, update descendants' path and level
    const newPath = category.path;
    const newLevel = category.level || 0;
    if (oldPath && newPath && oldPath !== newPath) {
      const delta = newLevel - oldLevel;
      const descendants = await Category.find({
        path: new RegExp(`^${oldPath}/`),
        isDeleted: false,
      });
      for (const child of descendants) {
        if (child.path) {
          child.path = child.path.replace(new RegExp(`^${oldPath}/`), `${newPath}/`);
        }
        if (typeof child.level === "number") {
          child.level = child.level + delta;
        }
        await child.save();
      }
    }

    const updatedCategory = await Category.findById(categoryId)
      .populate("parent")
      .populate("children");

    res.json({
      success: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: updatedCategory,
    });
    return;
  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }
    next(error);
  }
};

// Delete category by ID
export const deleteCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!category) {
      next(new appError("Category not found", 404));
      return;
    }

    // Check if category has children
    const children = await Category.find({
      parentId: category._id,
      isDeleted: false,
    });

    if (children.length > 0) {
      next(
        new appError(
          "Cannot delete category with subcategories. Delete subcategories first.",
          400
        )
      );
      return;
    }

    // Soft delete the category
    category.isDeleted = true;
    await category.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: category,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentIdRaw = (req.query.parentId as string) || null;
    const maxDepth = parseInt(req.query.maxDepth as string) || 3;

    let parentId: mongoose.Types.ObjectId | null;
    try {
      parentId = parseParentId(parentIdRaw);
    } catch (err: any) {
      return next(new appError(err.message, 400));
    }

    // Optimized BFS: perform at most `maxDepth` queries instead of N+1 recursive queries
    if (maxDepth <= 0) {
      return res.json({
        success: true,
        statusCode: 200,
        message: 'Category tree retrieved successfully',
        data: [],
      });
    }

    const selectFields = 'title slug description image icon parentId level path isActive displayOrder';

    // Level 1 (direct children of parentId)
    const level1 = await Category.find({
      parentId: parentId,
      isDeleted: false,
      isActive: true,
    })
      .select(selectFields)
      .sort({ displayOrder: 1, title: 1 })
      .lean();

    // Prepare map for quick parent lookup and initialize roots
    const nodeMap = new Map<string, any>();
    const roots: any[] = level1.map((doc: any) => {
      const node = { ...doc, children: [] as any[] };
      nodeMap.set(String(doc._id), node);
      return node;
    });

    // Build next levels iteratively
    let currentLevel = level1;
    for (let depth = 2; depth <= maxDepth; depth++) {
      const parentIds = currentLevel.map((p: any) => p._id);
      if (!parentIds.length) break;

      const children = await Category.find({
        parentId: { $in: parentIds },
        isDeleted: false,
        isActive: true,
      })
        .select(selectFields)
        .sort({ displayOrder: 1, title: 1 })
        .lean();

      for (const ch of children) {
        const parentKey = String(ch.parentId);
        const parentNode = nodeMap.get(parentKey);
        if (parentNode) {
          const childNode = { ...ch, children: [] as any[] };
          nodeMap.set(String(ch._id), childNode);
          parentNode.children.push(childNode);
        }
      }

      currentLevel = children;
    }

    const categories = roots;

    if (!categories || categories.length === 0) {
      return next(new appError("No categories found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category tree retrieved successfully",
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get root categories (level 0)
export const getRootCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Fetching root categories"); // --- IGNORE ---
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Category.countDocuments({
      isDeleted: false,
      isActive: true,
      parentId: null,
    });
    const totalPages = Math.ceil(total / limit);

    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
      parentId: null,
    })
      .sort({ displayOrder: 1, title: 1 })
      .skip(skip)
      .limit(limit)
      .populate("children")
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "Root categories retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get categories by parent ID
export const getCategoriesByParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentIdRaw = req.params.parentId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let parentId: mongoose.Types.ObjectId | null;
    try {
      parentId = parseParentId(parentIdRaw);
    } catch (err: any) {
      return next(new appError(err.message, 400));
    }

    if (parentId !== null) {
      const parent = await Category.findOne({
        _id: parentId,
        isDeleted: false,
      }).lean();

      if (!parent) {
        return next(new appError("Parent category not found", 404));
      }
    }

    const query = {
      parentId: parentId,
      isDeleted: false,
      isActive: true,
    };

    const total = await Category.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, title: 1 })
      .skip(skip)
      .limit(limit)
      .populate("parent")
      .populate("children")
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get category breadcrumbs (ancestors)
export const getCategoryBreadcrumbs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!category) {
      next(new appError("Category not found", 404));
      return;
    }

    const breadcrumbs = await (category as any).getAncestors();
    breadcrumbs.push(category); // Add current category

    res.json({
      success: true,
      statusCode: 200,
      message: "Category breadcrumbs retrieved successfully",
      data: breadcrumbs,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Search categories
export const searchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, level } = req.query;
    const statusRaw = (req.query.status as string) || undefined;
    const parentIdRaw = req.query.parentId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchQuery: any = {
      isDeleted: false,
    };

    // For public calls (no admin role header), default to active only
    const hasAdminHeader = Boolean(req.headers["x-user-role"]);
    if (!hasAdminHeader) {
      searchQuery.isActive = true;
    } else {
      // Admin/vender can filter by status
      if (statusRaw === "inactive") {
        searchQuery.isActive = false;
      } else if (statusRaw === "active") {
        searchQuery.isActive = true;
      } // else 'all' -> do not set isActive to allow both
    }

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { path: { $regex: query, $options: "i" } },
      ];
    }

    if (level !== undefined) {
      searchQuery.level = parseInt(level as string);
    }

    if (parentIdRaw !== undefined) {
      try {
        searchQuery.parentId = parseParentId(parentIdRaw);
      } catch (err: any) {
        return next(new appError(err.message, 400));
      }
    }

    const total = await Category.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    const categories = await Category.find(searchQuery)
      .sort({ displayOrder: 1, title: 1 })
      .skip(skip)
      .limit(limit)
      .populate("parent")
      .lean();

    res.json({
      success: true,
      statusCode: 200,
      message: "Categories search completed",
      meta: {
        page,
        limit,
        total,
        totalPages,
        query,
      },
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create category from template
export const createCategoryFromTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryType, includeDefaultAttributes = true } = req.body;
    const { parentId } = req.query;

    const validatedData = categoryTemplateValidation.parse({
      categoryType,
      includeDefaultAttributes,
    });

    const template =
      CATEGORY_TEMPLATES[
        validatedData.categoryType as keyof typeof CATEGORY_TEMPLATES
      ];
    if (!template) {
      next(new appError("Invalid category type", 400));
      return;
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      title: template.title,
      parentId: parentId || null,
      isDeleted: false,
    });

    if (existingCategory) {
      next(
        new appError(
          `${template.title} category already exists at this level`,
          400
        )
      );
      return;
    }

    const categoryData: ICreateCategoryDto = {
      title: template.title,
      description: template.description,
      icon: template.icon,
      parentId: parentId as string,
      attributes: includeDefaultAttributes ? template.attributes : [],
      displayOrder: 0,
    };

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: `${template.title} category created successfully from template`,
      data: category,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get available category templates
export const getCategoryTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const templates = Object.keys(CATEGORY_TEMPLATES).map((key) => ({
      type: key,
      ...CATEGORY_TEMPLATES[key as keyof typeof CATEGORY_TEMPLATES],
    }));

    res.json({
      success: true,
      statusCode: 200,
      message: "Category templates retrieved successfully",
      data: templates,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create comprehensive category structure like Myntra
export const createComprehensiveCategoryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const createdCategories: any[] = [];

    // Main category structure
    const mainCategories = [
      {
        title: "Men",
        description: "Men's fashion and accessories",
        icon: "fas fa-male",
        displayOrder: 1,
        children: [
          {
            title: "Topwear",
            description: "Upper body clothing for men",
            children: [
              { title: "T-Shirts", description: "Casual t-shirts for everyday wear" },
              { title: "Casual Shirts", description: "Comfortable shirts for casual occasions" },
              { title: "Formal Shirts", description: "Professional shirts for office wear" },
              { title: "Sweatshirts", description: "Warm and comfortable sweatshirts" },
              { title: "Sweaters", description: "Knitted sweaters for cold weather" },
              { title: "Jackets", description: "Casual and formal jackets" },
              { title: "Blazers & Coats", description: "Professional blazers and coats" },
              { title: "Suits", description: "Complete formal suits" },
              { title: "Rain Jackets", description: "Weather-resistant outerwear" }
            ]
          },
          {
            title: "Indian & Festive Wear",
            description: "Traditional Indian clothing",
            children: [
              { title: "Kurtas & Kurta Sets", description: "Traditional kurtas and sets" },
              { title: "Sherwanis", description: "Traditional formal wear" },
              { title: "Nehru Jackets", description: "Traditional formal jackets" },
              { title: "Dhotis", description: "Traditional lower wear" }
            ]
          },
          {
            title: "Bottomwear",
            description: "Lower body clothing",
            children: [
              { title: "Jeans", description: "Denim jeans in various styles" },
              { title: "Casual Trousers", description: "Comfortable trousers for everyday wear" },
              { title: "Formal Trousers", description: "Professional trousers for office wear" },
              { title: "Shorts", description: "Short pants for casual activities" },
              { title: "Trackpants", description: "Comfortable pants for sports" }
            ]
          },
          {
            title: "Footwear",
            description: "Men's shoes and footwear",
            children: [
              { title: "Casual Shoes", description: "Everyday shoes for casual wear" },
              { title: "Sports Shoes", description: "Athletic shoes for sports" },
              { title: "Formal Shoes", description: "Professional shoes for office" },
              { title: "Sneakers", description: "Trendy sneakers" },
              { title: "Sandals & Floaters", description: "Casual open footwear" },
              { title: "Flip Flops", description: "Beach and casual wear" }
            ]
          },
          {
            title: "Sports & Active Wear",
            description: "Athletic and sports clothing",
            children: [
              { title: "Sports Shoes", description: "Athletic footwear" },
              { title: "Sports T-Shirts", description: "Performance t-shirts" },
              { title: "Track Pants", description: "Athletic pants" },
              { title: "Jackets", description: "Sports jackets" },
              { title: "Shorts", description: "Sports shorts" }
            ]
          },
          {
            title: "Fashion Accessories",
            description: "Men's accessories",
            children: [
              { title: "Wallets", description: "Leather and fabric wallets" },
              { title: "Belts", description: "Formal and casual belts" },
              { title: "Perfumes & Body Mists", description: "Fragrances" },
              { title: "Trimmers", description: "Grooming accessories" },
              { title: "Deodorants", description: "Body care" },
              { title: "Ties, Cufflinks & Pocket Squares", description: "Formal accessories" },
              { title: "Accessory Gift Sets", description: "Gift sets" },
              { title: "Caps & Hats", description: "Head accessories" },
              { title: "Mufflers, Scarves & Gloves", description: "Winter accessories" },
              { title: "Phone Cases", description: "Mobile accessories" },
              { title: "Rings & Wristwear", description: "Jewelry accessories" },
              { title: "Helmets", description: "Safety gear" }
            ]
          }
        ]
      },
      {
        title: "Women",
        description: "Women's fashion and accessories",
        icon: "fas fa-female",
        displayOrder: 2,
        children: [
          {
            title: "Indian & Fusion Wear",
            description: "Traditional and fusion clothing",
            children: [
              { title: "Kurtas & Suits", description: "Traditional kurtas and suit sets" },
              { title: "Kurtis, Tunics & Tops", description: "Casual ethnic wear" },
              { title: "Sarees", description: "Traditional sarees" },
              { title: "Ethnic Wear", description: "Various ethnic clothing" },
              { title: "Leggings, Salwars & Churidars", description: "Traditional bottom wear" },
              { title: "Skirts & Palazzos", description: "Traditional and fusion skirts" },
              { title: "Dress Materials", description: "Unstitched fabrics" },
              { title: "Lehenga Cholis", description: "Festive wear" },
              { title: "Dupattas & Shawls", description: "Traditional accessories" },
              { title: "Jackets", description: "Ethnic jackets" }
            ]
          },
          {
            title: "Western Wear",
            description: "Western style clothing",
            children: [
              { title: "Dresses", description: "Casual and formal dresses" },
              { title: "Tops", description: "Various styles of tops" },
              { title: "Tshirts", description: "Casual t-shirts" },
              { title: "Jeans", description: "Denim jeans" },
              { title: "Trousers & Capris", description: "Western bottom wear" },
              { title: "Shorts & Skirts", description: "Casual wear" },
              { title: "Co-ords", description: "Coordinated sets" },
              { title: "Playsuits", description: "One-piece casual wear" },
              { title: "Jumpsuits", description: "One-piece formal wear" },
              { title: "Shrugs", description: "Light outer wear" },
              { title: "Sweaters & Sweatshirts", description: "Winter wear" },
              { title: "Jackets & Coats", description: "Outer wear" },
              { title: "Blazers & Waistcoats", description: "Formal wear" }
            ]
          },
          {
            title: "Footwear",
            description: "Women's shoes and footwear",
            children: [
              { title: "Flats", description: "Comfortable flat shoes" },
              { title: "Casual Shoes", description: "Everyday footwear" },
              { title: "Heels", description: "High heel shoes" },
              { title: "Boots", description: "Various types of boots" },
              { title: "Sports Shoes & Floaters", description: "Athletic and casual shoes" }
            ]
          },
          {
            title: "Sports & Active Wear",
            description: "Athletic wear for women",
            children: [
              { title: "Clothing", description: "Sports clothing" },
              { title: "Footwear", description: "Sports footwear" },
              { title: "Sports Accessories", description: "Athletic accessories" },
              { title: "Sports Equipment", description: "Sports gear" }
            ]
          },
          {
            title: "Lingerie & Sleepwear",
            description: "Intimate wear and nightwear",
            children: [
              { title: "Bra", description: "Various types of bras" },
              { title: "Briefs", description: "Underwear" },
              { title: "Shapewear", description: "Body shaping wear" },
              { title: "Sleepwear & Loungewear", description: "Night and lounge wear" },
              { title: "Swimwear", description: "Swimming costumes" },
              { title: "Camisoles", description: "Undergarments" }
            ]
          },
          {
            title: "Beauty & Personal Care",
            description: "Beauty and grooming products",
            children: [
              { title: "Makeup", description: "Cosmetics and makeup" },
              { title: "Wellness & Hygiene", description: "Personal care products" },
              { title: "Skincare", description: "Skin care products" },
              { title: "Premium Beauty", description: "High-end beauty products" },
              { title: "Lipsticks", description: "Lip colors" },
              { title: "Fragrances", description: "Perfumes and deodorants" }
            ]
          },
          {
            title: "Gadgets",
            description: "Women's gadgets and accessories",
            children: [
              { title: "Smart Wearables", description: "Smartwatches and fitness trackers" },
              { title: "Fitness Gadgets", description: "Health and fitness devices" },
              { title: "Headphones", description: "Audio accessories" },
              { title: "Speakers", description: "Audio devices" }
            ]
          },
          {
            title: "Jewellery",
            description: "Fashion and traditional jewelry",
            children: [
              { title: "Fashion Jewellery", description: "Trendy jewelry" },
              { title: "Fine Jewellery", description: "Premium jewelry" },
              { title: "Earrings", description: "Various types of earrings" }
            ]
          },
          {
            title: "Handbags, Bags & Wallets",
            description: "Women's bags and accessories",
            children: [
              { title: "Handbags", description: "Various handbags" },
              { title: "Bags & Backpacks", description: "Casual and formal bags" },
              { title: "Wallets & Wristlets", description: "Wallets and small accessories" }
            ]
          }
        ]
      },
      {
        title: "Kids",
        description: "Kids fashion and accessories",
        icon: "fas fa-child",
        displayOrder: 3,
        children: [
          {
            title: "Boys Clothing",
            description: "Clothing for boys",
            children: [
              { title: "T-Shirts", description: "Boys t-shirts" },
              { title: "Shirts", description: "Boys shirts" },
              { title: "Shorts", description: "Boys shorts" },
              { title: "Jeans", description: "Boys jeans" },
              { title: "Clothing Sets", description: "Boys clothing sets" },
              { title: "Ethnic Wear", description: "Traditional wear for boys" },
              { title: "Track Pants & Pyjamas", description: "Comfortable wear" },
              { title: "Jacket, Sweater & Sweatshirts", description: "Winter wear" },
              { title: "Party Wear", description: "Special occasion wear" },
              { title: "Innerwear & Thermals", description: "Undergarments" },
              { title: "Nightwear & Loungewear", description: "Sleepwear" },
              { title: "Value Packs", description: "Multi-pack items" }
            ]
          },
          {
            title: "Girls Clothing",
            description: "Clothing for girls",
            children: [
              { title: "Dresses", description: "Girls dresses" },
              { title: "Tops", description: "Girls tops" },
              { title: "Tshirts", description: "Girls t-shirts" },
              { title: "Clothing Sets", description: "Girls clothing sets" },
              { title: "Lehenga choli", description: "Traditional wear" },
              { title: "Kurta Sets", description: "Ethnic wear sets" },
              { title: "Party wear", description: "Special occasion wear" },
              { title: "Dungarees & Jumpsuits", description: "One-piece wear" },
              { title: "Skirts & shorts", description: "Bottom wear" },
              { title: "Tights & Leggings", description: "Girls leggings" },
              { title: "Jeans, Trousers & Capris", description: "Casual wear" },
              { title: "Jacket, Sweater & Sweatshirts", description: "Winter wear" },
              { title: "Innerwear & Thermals", description: "Undergarments" },
              { title: "Nightwear & Loungewear", description: "Sleepwear" },
              { title: "Value Packs", description: "Multi-pack items" }
            ]
          },
          {
            title: "Footwear",
            description: "Kids footwear",
            children: [
              { title: "Casual Shoes", description: "Everyday shoes for kids" },
              { title: "Flipflops", description: "Casual footwear" },
              { title: "Sports Shoes", description: "Athletic shoes for kids" },
              { title: "Flats", description: "Formal shoes for girls" },
              { title: "Sandals", description: "Open footwear" },
              { title: "Heels", description: "Dress shoes for girls" },
              { title: "Socks", description: "Kids socks" }
            ]
          },
          {
            title: "Toys & Games",
            description: "Toys and games for kids",
            children: [
              { title: "Learning & Development", description: "Educational toys" },
              { title: "Activity Toys", description: "Interactive toys" },
              { title: "Soft Toys", description: "Plush toys" },
              { title: "Action Figure / Play set", description: "Action toys" }
            ]
          },
          {
            title: "Infants",
            description: "Baby and infant products",
            children: [
              { title: "Bodysuits", description: "Baby bodysuits" },
              { title: "Rompers & Sleepsuits", description: "Baby one-piece wear" },
              { title: "Clothing Sets", description: "Baby clothing sets" },
              { title: "Tshirts & Tops", description: "Baby tops" },
              { title: "Dresses", description: "Baby dresses" },
              { title: "Bottom wear", description: "Baby pants and shorts" },
              { title: "Winter Wear", description: "Baby winter clothing" },
              { title: "Innerwear & Sleepwear", description: "Baby undergarments" },
              { title: "Infant Care", description: "Baby care products" }
            ]
          },
          {
            title: "Home & Bath",
            description: "Kids home and bath items"
          },
          {
            title: "Personal Care",
            description: "Kids personal care products"
          }
        ]
      },
      {
        title: "Electronics",
        description: "Electronic devices and gadgets",
        icon: "fas fa-laptop",
        displayOrder: 4,
        children: [
          {
            title: "Mobiles",
            description: "Mobile phones and accessories",
            children: [
              { title: "Smartphones", description: "Latest smartphones" },
              { title: "Feature Phones", description: "Basic mobile phones" },
              { title: "Mobile Accessories", description: "Phone cases, chargers, etc." },
              { title: "Power Banks", description: "Portable chargers" },
              { title: "Headphones & Earphones", description: "Audio accessories" },
              { title: "Screen Guards", description: "Phone screen protection" },
              { title: "Memory Cards", description: "Storage expansion" },
              { title: "Smart Wearables", description: "Smartwatches and fitness trackers" }
            ]
          },
          {
            title: "Laptops & Computers",
            description: "Computing devices and accessories",
            children: [
              { title: "Laptops", description: "Portable computers" },
              { title: "Desktop PCs", description: "Desktop computers" },
              { title: "Gaming Laptops", description: "High-performance laptops" },
              { title: "Computer Accessories", description: "Keyboards, mouse, etc." },
              { title: "External Hard Drives", description: "Storage devices" },
              { title: "Monitors", description: "Computer displays" },
              { title: "Printers", description: "Printing devices" }
            ]
          },
          {
            title: "TV, Audio & Large Appliances",
            description: "Home entertainment and appliances",
            children: [
              { title: "Televisions", description: "LED, OLED, Smart TVs" },
              { title: "Home Theatre Systems", description: "Audio systems" },
              { title: "Speakers", description: "Audio speakers" },
              { title: "Refrigerators", description: "Cooling appliances" },
              { title: "Washing Machines", description: "Laundry appliances" },
              { title: "Air Conditioners", description: "Cooling systems" },
              { title: "Kitchen Appliances", description: "Cooking appliances" }
            ]
          },
          {
            title: "Cameras",
            description: "Photography equipment",
            children: [
              { title: "DSLR Cameras", description: "Professional cameras" },
              { title: "Point & Shoot Cameras", description: "Compact cameras" },
              { title: "Action Cameras", description: "Adventure cameras" },
              { title: "Camera Accessories", description: "Lenses, tripods, etc." }
            ]
          },
          {
            title: "Gaming",
            description: "Gaming consoles and accessories",
            children: [
              { title: "Gaming Consoles", description: "PlayStation, Xbox, etc." },
              { title: "Gaming Accessories", description: "Controllers, headsets" },
              { title: "PC Gaming", description: "Gaming PCs and components" }
            ]
          }
        ]
      },
      {
        title: "Home & Living",
        description: "Home decor and living essentials",
        icon: "fas fa-home",
        displayOrder: 5,
        children: [
          {
            title: "Bed Linen & Furnishing",
            description: "Bedroom essentials",
            children: [
              { title: "Bed Runners", description: "Bed decoratives" },
              { title: "Mattress Protectors", description: "Bed protection" },
              { title: "Bedsheets", description: "Bed linens" },
              { title: "Bedding Sets", description: "Complete bedding" },
              { title: "Blankets, Quilts & Dohars", description: "Bed covers" },
              { title: "Pillows & Pillow Covers", description: "Sleep accessories" },
              { title: "Bed Covers", description: "Decorative covers" }
            ]
          },
          {
            title: "Flooring",
            description: "Floor coverings and mats",
            children: [
              { title: "Carpets", description: "Floor carpets" },
              { title: "Floor Runners", description: "Hallway carpets" },
              { title: "Door Mats", description: "Entrance mats" }
            ]
          },
          {
            title: "Bath",
            description: "Bathroom essentials",
            children: [
              { title: "Bath Towels", description: "Towels for bathing" },
              { title: "Hand & Face Towels", description: "Small towels" },
              { title: "Beach Towels", description: "Large outdoor towels" },
              { title: "Towels Set", description: "Towel collections" },
              { title: "Bath Rugs", description: "Bathroom mats" },
              { title: "Bath Robes", description: "After-bath wear" },
              { title: "Bathroom Accessories", description: "Bath accessories" }
            ]
          },
          {
            title: "Lamps & Lighting",
            description: "Home lighting solutions",
            children: [
              { title: "Floor Lamps", description: "Standing lamps" },
              { title: "Ceiling Lamps", description: "Overhead lighting" },
              { title: "Table Lamps", description: "Desk lighting" },
              { title: "Wall Lamps", description: "Wall-mounted lighting" },
              { title: "Outdoor Lamps", description: "Garden lighting" },
              { title: "String Lights", description: "Decorative lighting" }
            ]
          },
          {
            title: "Home Decor",
            description: "Decorative items for home",
            children: [
              { title: "Plants & Planters", description: "Indoor plants" },
              { title: "Aromas & Candles", description: "Scented items" },
              { title: "Clocks", description: "Wall and table clocks" },
              { title: "Mirrors", description: "Decorative mirrors" },
              { title: "Wall Decor", description: "Wall decorations" },
              { title: "Festive Decor", description: "Holiday decorations" },
              { title: "Pooja Essentials", description: "Religious items" },
              { title: "Wall Stickers", description: "Decorative stickers" }
            ]
          },
          {
            title: "Cushions & Cushion Covers",
            description: "Comfort and decoration",
            children: [
              { title: "Cushions", description: "Soft furnishings" },
              { title: "Cushion Covers", description: "Decorative covers" },
              { title: "Diwan Sets", description: "Traditional seating" },
              { title: "Chair Pads & Covers", description: "Seating accessories" },
              { title: "Sofa Covers", description: "Furniture protection" }
            ]
          },
          {
            title: "Curtains",
            description: "Window treatments",
            children: [
              { title: "Door Curtains", description: "Entrance curtains" },
              { title: "Window Curtains", description: "Window treatments" },
              { title: "Shower Curtains", description: "Bathroom curtains" }
            ]
          }
        ]
      },
      {
        title: "Beauty & Personal Care",
        description: "Beauty and grooming products",
        icon: "fas fa-star",
        displayOrder: 6,
        children: [
          {
            title: "Makeup",
            description: "Cosmetics and beauty products",
            children: [
              { title: "Face", description: "Face makeup" },
              { title: "Eyes", description: "Eye makeup" },
              { title: "Lips", description: "Lip colors" },
              { title: "Nails", description: "Nail care and color" }
            ]
          },
          {
            title: "Wellness & Hygiene",
            description: "Health and hygiene products",
            children: [
              { title: "Sanitizers", description: "Hand sanitizers" },
              { title: "Oral Care", description: "Dental care" },
              { title: "Feminine Hygiene", description: "Women's health" }
            ]
          },
          {
            title: "Skincare, Bath & Body",
            description: "Skin and body care",
            children: [
              { title: "Face Care", description: "Facial skincare" },
              { title: "Body Care", description: "Body skincare" },
              { title: "Baby Care", description: "Baby skincare" },
              { title: "Masks & Peels", description: "Face treatments" },
              { title: "Moisturizers", description: "Skin moisturizers" },
              { title: "Cleanser", description: "Skin cleansing" },
              { title: "More", description: "Additional skincare" }
            ]
          },
          {
            title: "Hair Care",
            description: "Hair care products",
            children: [
              { title: "Shampoo", description: "Hair cleansing" },
              { title: "Conditioner", description: "Hair conditioning" },
              { title: "Hair Cream", description: "Hair styling" },
              { title: "Hair Oil", description: "Hair nourishment" },
              { title: "Hair Gel & Wax", description: "Hair styling products" },
              { title: "Hair Color", description: "Hair coloring" },
              { title: "Hair Serum", description: "Hair treatment" },
              { title: "Hair Accessories", description: "Hair styling tools" }
            ]
          },
          {
            title: "Fragrances",
            description: "Perfumes and fragrances",
            children: [
              { title: "Perfume", description: "Premium fragrances" },
              { title: "Deodorant", description: "Body deodorants" },
              { title: "Body Mist", description: "Light fragrances" }
            ]
          },
          {
            title: "Men's Grooming",
            description: "Men's personal care",
            children: [
              { title: "Trimmers", description: "Hair and beard trimmers" },
              { title: "Beard Care", description: "Beard grooming" },
              { title: "Shaving", description: "Shaving essentials" }
            ]
          },
          {
            title: "Beauty Gift & Makeup Set",
            description: "Beauty gift sets",
            children: [
              { title: "Beauty Gift", description: "Gift sets" },
              { title: "Makeup Kit", description: "Complete makeup sets" }
            ]
          },
          {
            title: "Premium Beauty",
            description: "Luxury beauty products"
          },
          {
            title: "Wellness & Hygiene",
            description: "Health and wellness products"
          }
        ]
      }
    ];

    // Helper function to create category with error handling
    const createCategoryWithChildren = async (categoryData: any, parentId: string | null = null) => {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({
          title: categoryData.title,
          parentId: parentId,
          isDeleted: false,
        });

        if (existingCategory) {
          return existingCategory;
        }

        // Create the category
        const category = new Category({
          title: categoryData.title,
          description: categoryData.description,
          icon: categoryData.icon,
          parentId: parentId,
          attributes: categoryData.title === "Men" || categoryData.title === "Women" ? CATEGORY_TEMPLATES.fashion.attributes : 
                     categoryData.title === "Electronics" ? CATEGORY_TEMPLATES.electronics.attributes :
                     categoryData.title === "Home & Living" ? CATEGORY_TEMPLATES.furniture.attributes : [],
          displayOrder: categoryData.displayOrder || 0,
        });

        await category.save();
        createdCategories.push(category);

        // Create children recursively
        if (categoryData.children && categoryData.children.length > 0) {
          for (const child of categoryData.children) {
            await createCategoryWithChildren(child, category._id as string);
          }
        }

        return category;
      } catch (error) {
        throw error;
      }
    };

    // Create all main categories
    for (const mainCategory of mainCategories) {
      await createCategoryWithChildren(mainCategory);
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Comprehensive category structure created successfully",
      data: {
        totalCategoriesCreated: createdCategories.length,
        message: "Created complete e-commerce category structure similar to Myntra",
        categories: createdCategories.map(cat => ({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          path: cat.path
        }))
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create custom category structure
export const createCustomCategoryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories } = req.body;
    const createdCategories: any[] = [];

    // Helper function to create category with children
    const createCategoryWithChildren = async (categoryData: any, parentId: string | null = null) => {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({
          title: categoryData.title,
          parentId: parentId,
          isDeleted: false,
        });

        if (existingCategory) {
          return existingCategory;
        }

        // Create the category
        const category = new Category({
          title: categoryData.title,
          description: categoryData.description,
          icon: categoryData.icon,
          parentId: parentId,
          attributes: categoryData.attributes || [],
          displayOrder: categoryData.displayOrder || 0,
          seoTitle: categoryData.seoTitle,
          seoDescription: categoryData.seoDescription,
          seoKeywords: categoryData.seoKeywords || [],
        });

        await category.save();
        createdCategories.push(category);

        // Create children recursively
        if (categoryData.children && categoryData.children.length > 0) {
          for (const child of categoryData.children) {
            await createCategoryWithChildren(child, category._id as string);
          }
        }

        return category;
      } catch (error) {
        throw error;
      }
    };

    // Create all categories from the request
    for (const categoryData of categories) {
      await createCategoryWithChildren(categoryData);
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Custom category structure created successfully",
      data: {
        totalCategoriesCreated: createdCategories.length,
        categories: createdCategories.map(cat => ({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          path: cat.path
        }))
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create predefined fashion category structure (for backward compatibility)
export const createFashionCategoryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Just call the comprehensive function - it handles fashion categories too
    await createComprehensiveCategoryStructure(req, res, next);
  } catch (error) {
    next(error);
  }
};
