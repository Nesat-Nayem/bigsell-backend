import { NextFunction, Request, Response } from "express";
import { Product } from "./product.model";
import { IProduct, IProductFilter } from "./product.interface";
import mongoose from "mongoose";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { ProductCategory } from "../Product-category/product-category.model";

// Create a new product
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body;
    const actingUser: any = (req as any).user;

    // If a vendor is creating the product, force-assign vendor field to the acting user
    if (actingUser?.role === "vendor") {
      productData.vendor = actingUser._id;
    }

    // Check if SKU already exists
    const existingSku = await Product.findOne({
      sku: productData.sku,
      isDeleted: false,
    });

    if (existingSku) {
      next(new appError("Product with this SKU already exists", 400));
      return;
    }

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      const base = slugify(productData.name);
      let candidate = base;
      let i = 1;

      while (await Product.findOne({ slug: candidate })) {
        candidate = `${base}-${i++}`;
      }
      productData.slug = candidate;
    }

    const result = await Product.create(productData);
    const populatedResult = await Product.findById(result._id)
      .populate("category", "title")
      .populate("subcategory", "title")
      .populate("subSubcategory", "title");

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product created successfully",
      data: populatedResult,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get products for management (admin sees all; vendor sees only their products)
export const getManageProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actingUser: any = (req as any).user;
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      status,
      isFeatured,
      isTrending,
      isNewArrival,
      isDiscount,
      isWeeklyBestSelling,
      isWeeklyDiscount,
      colors,
      sizes,
      rating,
      search,
      vendor,
    } = req.query as any;

    const filter: any = { isDeleted: false };

    // Vendor scoping
    if (actingUser?.role === "vendor") {
      filter.vendor = actingUser._id;
    } else if (vendor) {
      filter.vendor = vendor;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = new RegExp(String(subcategory), "i");
    if (brand) filter.brand = new RegExp(String(brand), "i");
    if (isFeatured !== undefined) filter.isFeatured = String(isFeatured) === "true";
    if (isTrending !== undefined) filter.isTrending = String(isTrending) === "true";
    if (isNewArrival !== undefined) filter.isNewArrival = String(isNewArrival) === "true";
    if (isDiscount !== undefined) filter.isDiscount = String(isDiscount) === "true";
    if (isWeeklyBestSelling !== undefined) filter.isWeeklyBestSelling = String(isWeeklyBestSelling) === "true";
    if (isWeeklyDiscount !== undefined) filter.isWeeklyDiscount = String(isWeeklyDiscount) === "true";
    if (inStock !== undefined) {
      filter.stock = String(inStock) === "true" ? { $gt: 0 } : 0;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (colors) {
      const colorArray = String(colors).split(",");
      filter.colors = { $in: colorArray };
    }

    if (sizes) {
      const sizeArray = String(sizes).split(",");
      filter.sizes = { $in: sizeArray };
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (search) {
      filter.$text = { $search: String(search) };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj: any = {};
    sortObj[String(sort)] = sortOrder;

    const skip = (Number(page) - 1) * Number(limit);

    const [rawProducts, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    const catIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.category)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const subIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.subcategory)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const subSubIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.subSubcategory)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const [catDocs, subDocs, subSubDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const subSubMap = new Map(subSubDocs.map((c: any) => [String(c._id), c.title]));

    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      const subSubId = p.subSubcategory ? String(p.subSubcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      if (subSubId && subSubMap.has(subSubId)) out.subSubcategory = { _id: subSubId, title: subSubMap.get(subSubId) };
      return out;
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products retrieved successfully",
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasPrevPage: Number(page) > 1,
        hasNextPage: Number(page) < totalPages,
      },
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get vendor product summary/statistics (vendor scoped)
export const getVendorProductSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actingUser: any = (req as any).user;
    if (!actingUser?._id) {
      next(new appError("User not authenticated", 401));
      return;
    }
    const vendorId = actingUser._id;

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStock,
      lowStock,
    ] = await Promise.all([
      Product.countDocuments({ isDeleted: false, vendor: vendorId }),
      Product.countDocuments({ status: "active", isDeleted: false, vendor: vendorId }),
      Product.countDocuments({ status: "inactive", isDeleted: false, vendor: vendorId }),
      Product.countDocuments({ isDeleted: false, vendor: vendorId, $or: [ { stock: { $lte: 0 } }, { stock: { $exists: false } } ] }),
      Product.countDocuments({ isDeleted: false, vendor: vendorId, $expr: { $lte: [ "$stock", { $ifNull: [ "$minStock", 0 ] } ] } }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Vendor product summary retrieved successfully",
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStock,
        lowStock,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get product summary/statistics (admin only)
export const getProductSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStock,
      lowStock,
    ] = await Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ status: "active", isDeleted: false }),
      Product.countDocuments({ status: "inactive", isDeleted: false }),
      Product.countDocuments({ isDeleted: false, $or: [ { stock: { $lte: 0 } }, { stock: { $exists: false } } ] }),
      Product.countDocuments({ isDeleted: false, $expr: { $lte: [ "$stock", { $ifNull: [ "$minStock", 0 ] } ] } }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product summary retrieved successfully",
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStock,
        lowStock,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get discount products
export const getDiscountProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      discount: { $gt: 0 },
      status: "active",
      isDeleted: false,
    })
      .sort({ discount: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subSubIds = Array.from(new Set(rawProducts.map((p: any) => p.subSubcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs, subSubDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const subSubMap = new Map(subSubDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      const subSubId = p.subSubcategory ? String(p.subSubcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      if (subSubId && subSubMap.has(subSubId)) out.subSubcategory = { _id: subSubId, title: subSubMap.get(subSubId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Discount products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get weekly best selling products
export const getWeeklyBestSellingProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      isWeeklyBestSelling: true,
      status: "active",
      isDeleted: false,
    })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(Number(limit))
      .lean();
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Weekly best selling products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get weekly discount products
export const getWeeklyDiscountProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      isWeeklyDiscount: true,
      status: "active",
      isDeleted: false,
    })
      .sort({ discount: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Weekly discount products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get single product by slug
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params as { slug: string };

    const product = await Product.findOne({ slug, isDeleted: false })
      .populate("category", "title")
      .populate("subcategory", "title")
      .populate("subSubcategory", "title")
      .lean();

    if (!product) {
      next(new appError("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product retrieved successfully",
      data: product,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get all products with filtering, sorting, and pagination
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      subcategory,
      subSubcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      status = "active",
      isFeatured,
      isTrending,
      isNewArrival,
      isDiscount,
      isWeeklyBestSelling,
      isWeeklyDiscount,
      colors,
      sizes,
      rating,
      search,
    } = req.query;

    // Build filter object
    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(String(category))) {
        next(new appError("Invalid category ID", 400));
        return;
      }
      filter.category = category;
    }
    if (subcategory) {
      if (!mongoose.Types.ObjectId.isValid(String(subcategory))) {
        next(new appError("Invalid subcategory ID", 400));
        return;
      }
      filter.subcategory = subcategory;
    }
    if (subSubcategory) {
      if (!mongoose.Types.ObjectId.isValid(String(subSubcategory))) {
        next(new appError("Invalid sub-subcategory ID", 400));
        return;
      }
      filter.subSubcategory = subSubcategory;
    }
    if (brand) filter.brand = new RegExp(brand as string, "i");
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isTrending !== undefined) filter.isTrending = isTrending === "true";
    if (isNewArrival !== undefined)
      filter.isNewArrival = isNewArrival === "true";
    if (isDiscount !== undefined) filter.isDiscount = isDiscount === "true";
    if (isWeeklyBestSelling !== undefined)
      filter.isWeeklyBestSelling = isWeeklyBestSelling === "true";
    if (isWeeklyDiscount !== undefined)
      filter.isWeeklyDiscount = isWeeklyDiscount === "true";
    if (inStock !== undefined) {
      filter.stock = inStock === "true" ? { $gt: 0 } : 0;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Colors filter
    if (colors) {
      const colorArray = (colors as string).split(",");
      filter.colors = { $in: colorArray };
    }

    // Sizes filter
    if (sizes) {
      const sizeArray = (sizes as string).split(",");
      filter.sizes = { $in: sizeArray };
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search as string };
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [rawProducts, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Manually map category and subcategory titles without triggering cast errors
    const catIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.category)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const subIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.subcategory)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const subSubIds = Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.subSubcategory)
          .filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => String(id))
      )
    );
    const [catDocs, subDocs, subSubDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const subSubMap = new Map(subSubDocs.map((c: any) => [String(c._id), c.title]));

    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products retrieved successfully",
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError("Invalid product ID", 400));
      return;
    }

    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate("category", "title")
      .populate("subcategory", "title")
      .populate("subSubcategory", "title")
      .lean();

    if (!product) {
      next(new appError("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product retrieved successfully",
      data: product,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const actingUser: any = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError("Invalid product ID", 400));
      return;
    }

    // Check if product exists
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingProduct) {
      next(new appError("Product not found", 404));
      return;
    }

    // Vendors can only update their own products
    if (actingUser?.role === "vendor") {
      if (String((existingProduct as any).vendor) !== String(actingUser._id)) {
        next(new appError("You do not have permission to update this product", 403));
        return;
      }
      // Ensure vendor field cannot be changed by vendor to another vendor
      if (updateData.vendor && String(updateData.vendor) !== String(actingUser._id)) {
        updateData.vendor = actingUser._id;
      }
    }

    // Check if SKU is being updated and if it already exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (existingSku) {
        next(new appError("Product with this SKU already exists", 400));
        return;
      }
    }

    // Handle slug regeneration if name changed and no explicit slug provided
    if (
      !updateData.slug &&
      updateData.name &&
      updateData.name !== existingProduct.name
    ) {
      const base = slugify(updateData.name);
      let candidate = base;
      let i = 1;
      while (await Product.findOne({ slug: candidate, _id: { $ne: id } })) {
        candidate = `${base}-${i++}`;
      }
      updateData.slug = candidate;
    } else if (updateData.slug) {
      // If slug provided, ensure it's unique
      const base = slugify(updateData.slug);
      let candidate = base;
      let i = 1;
      while (await Product.findOne({ slug: candidate, _id: { $ne: id } })) {
        candidate = `${base}-${i++}`;
      }
      updateData.slug = candidate;
    }

    const result = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "title")
      .populate("subcategory", "title")
      .populate("subSubcategory", "title");

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product updated successfully",
      data: result,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Delete product (soft delete)
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const actingUser: any = (req as any).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError("Invalid product ID", 400));
      return;
    }

    // If vendor, verify ownership before deletion
    if (actingUser?.role === "vendor") {
      const existingProduct = await Product.findOne({ _id: id, isDeleted: false });
      if (!existingProduct) {
        next(new appError("Product not found", 404));
        return;
      }
      if (String((existingProduct as any).vendor) !== String(actingUser._id)) {
        next(new appError("You do not have permission to delete this product", 403));
        return;
      }
    }

    const result = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!result) {
      next(new appError("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get featured products
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      isFeatured: true,
      status: "active",
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    // Map titles safely
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Featured products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get trending products
export const getTrendingProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      isTrending: true,
      status: "active",
      isDeleted: false,
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit))
      .lean();
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Trending products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get new arrival products
export const getNewArrivalProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const rawProducts = await Product.find({
      isNewArrival: true,
      status: "active",
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    const catIds = Array.from(new Set(rawProducts.map((p: any) => p.category).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const subIds = Array.from(new Set(rawProducts.map((p: any) => p.subcategory).filter((id: any) => id && mongoose.Types.ObjectId.isValid(String(id))).map(String)));
    const [catDocs, subDocs] = await Promise.all([
      ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
      ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
    ]);
    const catMap = new Map(catDocs.map((c: any) => [String(c._id), c.title]));
    const subMap = new Map(subDocs.map((c: any) => [String(c._id), c.title]));
    const products = rawProducts.map((p: any) => {
      const out: any = { ...p };
      const catId = p.category ? String(p.category) : null;
      const subId = p.subcategory ? String(p.subcategory) : null;
      if (catId && catMap.has(catId)) out.category = { _id: catId, title: catMap.get(catId) };
      if (subId && subMap.has(subId)) out.subcategory = { _id: subId, title: subMap.get(subId) };
      return out;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "New arrival products retrieved successfully",
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      next(new appError("Invalid category ID", 400));
      return;
    }

    const filter = {
      category: categoryId,
      status: "active",
      isDeleted: false,
    };

    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "title")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products retrieved successfully",
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      next(new appError("Search query is required", 400));
      return;
    }

    const filter = {
      $text: { $search: q as string },
      status: "active",
      isDeleted: false,
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: "textScore" } })
        .populate("category", "title")
        .populate("subcategory", "title")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products found successfully",
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
      data: products,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get product filters (for frontend filter options)
export const getProductFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [brands, colors, sizes, priceRange] = await Promise.all([
      Product.distinct("brand", { status: "active", isDeleted: false }),
      Product.distinct("colors", { status: "active", isDeleted: false }),
      Product.distinct("sizes", { status: "active", isDeleted: false }),
      Product.aggregate([
        { $match: { status: "active", isDeleted: false } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    const filters = {
      brands: brands.filter(Boolean),
      colors: colors.flat().filter(Boolean),
      sizes: sizes.flat().filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product filters retrieved successfully",
      data: filters,
    });
    return;
  } catch (error) {
    next(error);
  }
};
