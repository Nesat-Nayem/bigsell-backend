import { NextFunction, Response } from "express";
import { Coupon } from "./coupon.model";
import { Hotel } from "../hotel/hotel.model";
import { Cart } from "../cart/cart.model";
import { createCouponValidation, updateCouponValidation } from "./coupon.validation";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { ZodError } from "zod";
import mongoose from "mongoose";

// Helper function to get the correct cart (personal or shared table cart)
const getCartForRequest = async (req: userInterface) => {
    // Check body, then query for table info
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const userId = req.user._id;

    console.log("COUPON - getCartForRequest - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);

    if (hotelId && tableNumber) {
        const tableIdentifier = `${hotelId}_${tableNumber}`;
        console.log("COUPON - Looking for cart with tableIdentifier:", tableIdentifier);
        
        let cart = await Cart.findOne({ tableIdentifier });
        console.log("COUPON - Found cart:", cart ? "Yes" : "No");

        if (!cart) {
            // Create a new shared cart if none exists
            cart = new Cart({
                tableIdentifier,
                users: [userId],
                items: [],
                totalAmount: 0,
                discountAmount: 0,
            });
            await cart.save();
        } else if (!cart.users?.includes(userId)) {
            // Add user to existing shared cart
            if (!cart.users) cart.users = [];
            cart.users.push(userId);
            await cart.save();
        }
        return cart;
    } else {
        console.log("COUPON - No hotelId/tableNumber provided, using personal cart");
        // Fallback to personal cart for users not at a table
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0,
                discountAmount: 0,
            });
            await cart.save();
        }
        return cart;
    }
};

// Create a new coupon

export const createCoupon = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {

  try {
    const couponData = createCouponValidation.parse(req.body);

    // Explicitly validate incoming IDs
    if (!mongoose.Types.ObjectId.isValid(couponData.restaurantId)) {
        return next(new appError("The provided Restaurant ID is not a valid format.", 400));
    }
    if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
        return next(new appError("Authentication error: Vendor ID is invalid.", 401));
    }
    
    // Check if hotel belongs to the vendor
    const hotel = await Hotel.findOne({ 
      _id: couponData.restaurantId, 
      vendorId: req.user._id 
    });
    
    if (!hotel) {
      return next(new appError("Restaurant not found or you do not have permission to add coupons to it.", 404));
    }

    // Check if coupon code already exists for this vendor
    const existingCoupon = await Coupon.findOne({ 
      couponCode: couponData.couponCode, 
      vendorId: req.user._id 
    });
    if (existingCoupon) {
      return next(new appError("You have already created a coupon with this code.", 400));
    }
    
    const coupon = new Coupon({
      ...couponData,
      vendorId: req.user._id,
    });
    
    await coupon.save();
    
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Coupon created successfully",
      data: coupon,
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new appError(`Validation Error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400));
    }
    if (error instanceof mongoose.Error.CastError) {
        return next(new appError(`Invalid ID format for field '${error.path}'. Value: '${error.value}'`, 400));
    }
    next(error);
  }
};

// Get all coupons for a vendor
export const getVendorCoupons = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await Coupon.find({ vendorId: req.user._id })
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupons retrieved successfully",
      data: coupons,
    });
    
  } catch (error) {
    next(error);
  }
};

// Update a coupon
export const updateCoupon = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const couponId = req.params.id;
    const couponData = updateCouponValidation.parse(req.body);
    
    const coupon = await Coupon.findOne({ 
      _id: couponId, 
      vendorId: req.user._id 
    });
    
    if (!coupon) {
      return next(new appError("Coupon not found or you do not have permission to edit it.", 404));
    }

    // If restaurant is being changed, verify it belongs to the vendor
    if (couponData.restaurantId) {
      const hotel = await Hotel.findOne({ 
        _id: couponData.restaurantId, 
        vendorId: req.user._id 
      });
      if (!hotel) {
        return next(new appError("Restaurant not found or you do not have permission to assign this coupon to it.", 404));
      }
    }
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      couponData,
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete a coupon
export const deleteCoupon = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const couponId = req.params.id;
    
    const coupon = await Coupon.findOneAndDelete({ 
      _id: couponId, 
      vendorId: req.user._id 
    });
    
    if (!coupon) {
      return next(new appError("Coupon not found or you do not have permission to delete it.", 404));
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon deleted successfully",
      data: null,
    });
    
  } catch (error) {
    next(error);
  }
};

// Apply coupon to cart
export const applyCouponToCart = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return next(new appError("Coupon code is required.", 400));
    }
    
    // Find cart using the same logic as other controllers
    const cart = await getCartForRequest(req);
    if (!cart || cart.items.length === 0) {
      return next(new appError("Your cart is empty.", 400));
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      couponCode: couponCode.toUpperCase(), 
      isActive: true 
    });
    
    if (!coupon) {
      return next(new appError("Invalid or inactive coupon code.", 404));
    }

    // --- Start Validation ---
    
    // 1. Restaurant validation
    const restaurantIdInCart = cart.items[0].hotelId.toString();
    if (coupon.restaurantId.toString() !== restaurantIdInCart) {
      return next(new appError("This coupon is not valid for the items in your cart.", 400));
    }
    
    // 2. Date validation
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return next(new appError("This coupon has expired or is not yet active.", 400));
    }
    
    // 3. Usage limit validation
    if (coupon.totalUses >= coupon.usageLimit) {
      return next(new appError("This coupon has reached its usage limit.", 400));
    }
    
    // 4. Per-user usage limit
    const userUses = coupon.usedBy.filter(id => id.toString() === req.user._id.toString()).length;
    if (userUses >= coupon.usagePerUser) {
      return next(new appError("You have already used this coupon the maximum number of times.", 400));
    }
    
    // 5. Minimum order amount
    if (cart.totalAmount < coupon.minOrderAmount) {
      return next(new appError(`Minimum order amount of ₹${coupon.minOrderAmount} is required to use this coupon.`, 400));
    }
    
    // --- End Validation ---
    
    // Calculate discount
    const discount = (cart.totalAmount * coupon.discountPercentage) / 100;
    const finalDiscount = Math.min(discount, coupon.maxDiscountAmount);
    
    // Apply discount to cart
    cart.appliedCouponCode = coupon.couponCode;
    cart.discountAmount = finalDiscount;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon applied successfully.",
      data: {
        cart,
        discountAmount: finalDiscount
      },
    });
    
  } catch (error) {
    next(error);
  }
};

// Remove coupon from cart
export const removeCouponFromCart = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find cart using the same logic as other controllers
    const cart = await getCartForRequest(req);
    if (!cart) {
      return next(new appError("Cart not found.", 404));
    }
    
    cart.appliedCouponCode = undefined;
    cart.discountAmount = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon removed.",
      data: { cart },
    });
    
  } catch (error) {
    next(error);
  }
}; 