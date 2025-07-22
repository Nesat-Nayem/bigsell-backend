import { NextFunction, Request, Response } from 'express';
import { Wishlist } from './wishlist.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';
import { appError } from '../../errors/appError';

// Get user's wishlist
export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { page = 1, limit = 10, sort = '-addedAt', category, search } = req.query;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Find or create user wishlist
    const wishlist = await Wishlist.findOrCreateUserWishlist(userId);

    if (!wishlist || wishlist.items.length === 0) {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Wishlist retrieved successfully',
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0,
        },
        data: {
          _id: wishlist?._id,
          user: userId,
          items: [],
          totalItems: 0,
        },
      });
      return;
    }

    // Build aggregation pipeline for filtering and pagination
    const pipeline: any[] = [
      { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $match: {
          'productDetails.isDeleted': false,
          'productDetails.status': 'active',
        },
      },
    ];

    // Add category filter if provided
    if (category) {
      pipeline.push({
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      });
      pipeline.push({ $unwind: '$categoryDetails' });
      pipeline.push({
        $match: {
          $or: [
            { 'categoryDetails._id': new mongoose.Types.ObjectId(category as string) },
            { 'categoryDetails.name': { $regex: category, $options: 'i' } },
          ],
        },
      });
    }

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'productDetails.name': { $regex: search, $options: 'i' } },
            { 'productDetails.description': { $regex: search, $options: 'i' } },
            { 'productDetails.brand': { $regex: search, $options: 'i' } },
            { 'items.notes': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Add sorting
    const sortField = sort.toString().startsWith('-') ? sort.toString().substring(1) : sort.toString();
    const sortOrder = sort.toString().startsWith('-') ? -1 : 1;
    pipeline.push({ $sort: { [`items.${sortField}`]: sortOrder } });

    // Add pagination
    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    // Project final structure
    pipeline.push({
      $project: {
        _id: 1,
        user: 1,
        item: {
          product: '$productDetails',
          addedAt: '$items.addedAt',
          notes: '$items.notes',
        },
        totalItems: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    // Get total count for pagination
    const totalPipeline = [...pipeline.slice(0, -3)]; // Remove skip, limit, and project
    totalPipeline.push({ $count: 'total' });

    const [items, totalResult] = await Promise.all([
      Wishlist.aggregate(pipeline),
      Wishlist.aggregate(totalPipeline),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / Number(limit));

    // Group items back into wishlist structure
    const wishlistData = {
      _id: wishlist._id,
      user: userId,
      items: items.map(item => item.item),
      totalItems: total,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Wishlist retrieved successfully',
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
      data: wishlistData,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Add item to wishlist
export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId, notes } = req.body;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Check if product exists and is active
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
      status: 'active',
    });

    if (!product) {
      next(new appError('Product not found or inactive', 404));
      return;
    }

    // Find or create user wishlist
    const wishlist = await Wishlist.findOrCreateUserWishlist(userId);

    // Add item to wishlist
    await wishlist.addItem(productId, notes);

    // Get updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name price images thumbnail brand category status',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item added to wishlist successfully',
      data: updatedWishlist,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId } = req.params;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Find user wishlist
    const wishlist = await Wishlist.findOne({ user: userId, isDeleted: false });

    if (!wishlist) {
      next(new appError('Wishlist not found', 404));
      return;
    }

    // Check if item exists in wishlist
    if (!wishlist.hasItem(productId)) {
      next(new appError('Item not found in wishlist', 404));
      return;
    }

    // Remove item from wishlist
    await wishlist.removeItem(productId);

    // Get updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name price images thumbnail brand category status',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item removed from wishlist successfully',
      data: updatedWishlist,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update wishlist item notes
export const updateWishlistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId } = req.params;
    const { notes } = req.body;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Find user wishlist
    const wishlist = await Wishlist.findOne({ user: userId, isDeleted: false });

    if (!wishlist) {
      next(new appError('Wishlist not found', 404));
      return;
    }

    // Check if item exists in wishlist
    if (!wishlist.hasItem(productId)) {
      next(new appError('Item not found in wishlist', 404));
      return;
    }

    // Update item notes
    await wishlist.updateItemNotes(productId, notes || '');

    // Get updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name price images thumbnail brand category status',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Wishlist item updated successfully',
      data: updatedWishlist,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Clear entire wishlist
export const clearWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Find user wishlist
    const wishlist = await Wishlist.findOne({ user: userId, isDeleted: false });

    if (!wishlist) {
      next(new appError('Wishlist not found', 404));
      return;
    }

    // Clear wishlist
    await wishlist.clearWishlist();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Wishlist cleared successfully',
      data: {
        _id: wishlist._id,
        user: userId,
        items: [],
        totalItems: 0,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Check if item is in wishlist
export const checkItemInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId } = req.params;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Find user wishlist
    const wishlist = await Wishlist.findOne({ user: userId, isDeleted: false });

    const isInWishlist = wishlist ? wishlist.hasItem(productId) : false;

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Wishlist check completed',
      data: {
        productId,
        isInWishlist,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get wishlist summary
export const getWishlistSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Find user wishlist with populated products
    const wishlist = await Wishlist.findOne({ user: userId, isDeleted: false })
      .populate({
        path: 'items.product',
        select: 'name price category',
        populate: {
          path: 'category',
          select: 'name',
        },
      });

    if (!wishlist || wishlist.items.length === 0) {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Wishlist summary retrieved successfully',
        data: {
          totalItems: 0,
          recentlyAdded: 0,
          categories: [],
          priceRange: {
            min: 0,
            max: 0,
            average: 0,
          },
        },
      });
      return;
    }

    // Calculate summary statistics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyAdded = wishlist.items.filter(
      item => item.addedAt >= sevenDaysAgo
    ).length;

    // Category breakdown
    const categoryMap = new Map();
    const prices: number[] = [];

    wishlist.items.forEach(item => {
      const product = item.product as any;
      if (product && !product.isDeleted && product.status === 'active') {
        // Price tracking
        prices.push(product.price);

        // Category tracking
        if (product.category) {
          const categoryId = product.category._id?.toString() || product.category.toString();
          const categoryName = product.category.name || 'Unknown';

          if (categoryMap.has(categoryId)) {
            categoryMap.get(categoryId).itemCount++;
          } else {
            categoryMap.set(categoryId, {
              categoryId,
              categoryName,
              itemCount: 1,
            });
          }
        }
      }
    });

    // Price range calculation
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      average: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    };

    const summary = {
      totalItems: wishlist.totalItems,
      recentlyAdded,
      categories: Array.from(categoryMap.values()),
      priceRange,
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Wishlist summary retrieved successfully',
      data: summary,
    });
    return;
  } catch (error) {
    next(error);
  }
};
