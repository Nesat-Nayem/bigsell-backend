import { NextFunction, Request, Response } from 'express';
import { Cart } from './cart.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';
import { appError } from '../../errors/appError';

// Get user's cart
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { populate = 'true' } = req.query;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    let cart;
    if (populate === 'true') {
      cart = await (Cart as any).findUserCart(userId);
    } else {
      cart = await Cart.findOne({ user: userId, isDeleted: false });
    }

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: cart,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any)?.user?._id;
 
    const { productId, quantity, selectedColor, selectedSize } = req.body;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Check if product exists and is available
    const product = await Product.findOne({ 
      _id: productId, 
      isDeleted: false, 
      status: 'active' 
    });

    if (!product) {
      next(new appError('Product not found or unavailable', 404));
      return;
    }

    // Check stock availability
    if (product.stock < quantity) {
      next(new appError(`Only ${product.stock} items available in stock`, 400));
      return;
    }

    // Check if selected color/size is available
    if (selectedColor && !(product.colors ?? []).includes(selectedColor)) {
      next(new appError('Selected color is not available', 400));
      return;
    }

    if (selectedSize && !(product.sizes ?? []).includes(selectedSize)) {
      next(new appError('Selected size is not available', 400));
      return;
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId, isDeleted: false });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Add item to cart
    await (cart as any).addItem(productId, quantity, product.price, selectedColor, selectedSize);

    // Populate the cart with product details
    const populatedCart = await (Cart as any).findUserCart(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item added to cart successfully',
      data: populatedCart,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId } = req.params;
    const { quantity, selectedColor, selectedSize } = req.body;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId, isDeleted: false });
    
    if (!cart) {
      next(new appError('Cart not found', 404));
      return;
    }

    // Check if product exists and is available
    const product = await Product.findOne({ 
      _id: productId, 
      isDeleted: false, 
      status: 'active' 
    });

    if (!product) {
      next(new appError('Product not found or unavailable', 404));
      return;
    }

    // Check stock availability
    if (product.stock < quantity) {
      next(new appError(`Only ${product.stock} items available in stock`, 400));
      return;
    }

    // Update item in cart
    await (cart as any).updateItem(productId, quantity, selectedColor, selectedSize);

    // Get updated cart with populated data
    const updatedCart = await (Cart as any).findUserCart(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart item updated successfully',
      data: updatedCart,
    });
    return;
  } catch (error) {
    if (error instanceof Error && error.message === 'Item not found in cart') {
      next(new appError('Item not found in cart', 404));
      return;
    }
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { productId } = req.params;
    const { selectedColor, selectedSize } = req.query;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new appError('Invalid product ID', 400));
      return;
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId, isDeleted: false });
    
    if (!cart) {
      next(new appError('Cart not found', 404));
      return;
    }

    // Remove item from cart
    await (cart as any).removeItem(productId, selectedColor as string, selectedSize as string);

    // Get updated cart with populated data
    const updatedCart = await (Cart as any).findUserCart(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item removed from cart successfully',
      data: updatedCart,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
export const clearCart = async (
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

    // Find user's cart
    const cart = await Cart.findOne({ user: userId, isDeleted: false });
    
    if (!cart) {
      next(new appError('Cart not found', 404));
      return;
    }

    // Clear all items from cart
    await (cart as any).clearCart();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart cleared successfully',
      data: {
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        itemCount: 0,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get cart summary (lightweight version)
export const getCartSummary = async (
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

    const cart = await Cart.findOne({ user: userId, isDeleted: false });
    
    if (!cart) {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Cart summary retrieved successfully',
        data: {
          totalItems: 0,
          totalPrice: 0,
          itemCount: 0,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart summary retrieved successfully',
      data: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};
