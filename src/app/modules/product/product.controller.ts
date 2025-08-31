import { NextFunction, Request, Response } from 'express';
import { Product } from './product.model';
import { IProduct, IProductFilter } from './product.interface';
import mongoose from 'mongoose';
import { appError } from '../../errors/appError';

// Create a new product
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body;
    
    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku: productData.sku, isDeleted: false });
    if (existingSku) {
      next(new appError('Product with this SKU already exists', 400));
      return;
    }

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      let base = slugify(productData.name);
      let candidate = base;
      let i = 1;
      // Ensure uniqueness
      while (await Product.findOne({ slug: candidate })) {
        candidate = `${base}-${i++}`;
      }
      productData.slug = candidate;
    }

    const result = await Product.create(productData);
    const populatedResult = await Product.findById(result._id).populate('category', 'title');

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Product created successfully',
      data: populatedResult,
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
      .populate('category', 'title')
      .lean();

    if (!product) {
      next(new appError('Product not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product retrieved successfully',
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
      sort = 'createdAt',
      order = 'desc',
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      status = 'active',
      isFeatured,
      isTrending,
      isNewArrival,
      colors,
      sizes,
      rating,
      search,
    } = req.query;

    // Build filter object
    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = new RegExp(subcategory as string, 'i');
    if (brand) filter.brand = new RegExp(brand as string, 'i');
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isTrending !== undefined) filter.isTrending = isTrending === 'true';
    if (isNewArrival !== undefined) filter.isNewArrival = isNewArrival === 'true';
    if (inStock !== undefined) {
      filter.stock = inStock === 'true' ? { $gt: 0 } : 0;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Colors filter
    if (colors) {
      const colorArray = (colors as string).split(',');
      filter.colors = { $in: colorArray };
    }

    // Sizes filter
    if (sizes) {
      const sizeArray = (sizes as string).split(',');
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
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'title')
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
      message: 'Products retrieved successfully',
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
      next(new appError('Invalid product ID', 400));
      return;
    }

    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate('category', 'title')
      .lean();

    if (!product) {
      next(new appError('Product not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product retrieved successfully',
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Check if product exists
    const existingProduct = await Product.findOne({ _id: id, isDeleted: false });
    if (!existingProduct) {
      next(new appError('Product not found', 404));
      return;
    }

    // Check if SKU is being updated and if it already exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await Product.findOne({ 
        sku: updateData.sku, 
        isDeleted: false,
        _id: { $ne: id }
      });
      if (existingSku) {
        next(new appError('Product with this SKU already exists', 400));
        return;
      }
    }

    // Handle slug regeneration if name changed and no explicit slug provided
    if (!updateData.slug && updateData.name && updateData.name !== existingProduct.name) {
      let base = slugify(updateData.name);
      let candidate = base;
      let i = 1;
      while (await Product.findOne({ slug: candidate, _id: { $ne: id } })) {
        candidate = `${base}-${i++}`;
      }
      updateData.slug = candidate;
    } else if (updateData.slug) {
      // If slug provided, ensure it's unique
      let base = slugify(updateData.slug);
      let candidate = base;
      let i = 1;
      while (await Product.findOne({ slug: candidate, _id: { $ne: id } })) {
        candidate = `${base}-${i++}`;
      }
      updateData.slug = candidate;
    }

    const result = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'title');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product updated successfully',
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    const result = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      next(new appError('Product not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product deleted successfully',
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

    const products = await Product.find({
      isFeatured: true,
      status: 'active',
      isDeleted: false,
    })
      .populate('category', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Featured products retrieved successfully',
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

    const products = await Product.find({
      isTrending: true,
      status: 'active',
      isDeleted: false,
    })
      .populate('category', 'title')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Trending products retrieved successfully',
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

    const products = await Product.find({
      isNewArrival: true,
      status: 'active',
      isDeleted: false,
    })
      .populate('category', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'New arrival products retrieved successfully',
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
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      next(new appError('Invalid category ID', 400));
      return;
    }

    const filter = {
      category: categoryId,
      status: 'active',
      isDeleted: false,
    };

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'title')
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
      message: 'Products retrieved successfully',
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
      next(new appError('Search query is required', 400));
      return;
    }

    const filter = {
      $text: { $search: q as string },
      status: 'active',
      isDeleted: false,
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: 'textScore' } })
        .populate('category', 'title')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Products found successfully',
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
      Product.distinct('brand', { status: 'active', isDeleted: false }),
      Product.distinct('colors', { status: 'active', isDeleted: false }),
      Product.distinct('sizes', { status: 'active', isDeleted: false }),
      Product.aggregate([
        { $match: { status: 'active', isDeleted: false } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
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
      message: 'Product filters retrieved successfully',
      data: filters,
    });
    return;
  } catch (error) {
    next(error);
  }
};
