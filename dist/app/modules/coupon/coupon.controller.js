"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCouponFromCart = exports.applyCouponToCart = exports.deleteCoupon = exports.updateCoupon = exports.getVendorCoupons = exports.createCoupon = void 0;
const coupon_model_1 = require("./coupon.model");
const hotel_model_1 = require("../hotel/hotel.model");
const cart_model_1 = require("../cart/cart.model");
const coupon_validation_1 = require("./coupon.validation");
const appError_1 = require("../../errors/appError");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
// Helper function to get the correct cart (personal or shared table cart)
const getCartForRequest = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Check body, then query for table info
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const userId = req.user._id;
    console.log("COUPON - getCartForRequest - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);
    if (hotelId && tableNumber) {
        const tableIdentifier = `${hotelId}_${tableNumber}`;
        console.log("COUPON - Looking for cart with tableIdentifier:", tableIdentifier);
        let cart = yield cart_model_1.Cart.findOne({ tableIdentifier });
        console.log("COUPON - Found cart:", cart ? "Yes" : "No");
        if (!cart) {
            // Create a new shared cart if none exists
            cart = new cart_model_1.Cart({
                tableIdentifier,
                users: [userId],
                items: [],
                totalAmount: 0,
                discountAmount: 0,
            });
            yield cart.save();
        }
        else if (!((_a = cart.users) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
            // Add user to existing shared cart
            if (!cart.users)
                cart.users = [];
            cart.users.push(userId);
            yield cart.save();
        }
        return cart;
    }
    else {
        console.log("COUPON - No hotelId/tableNumber provided, using personal cart");
        // Fallback to personal cart for users not at a table
        let cart = yield cart_model_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new cart_model_1.Cart({
                user: userId,
                items: [],
                totalAmount: 0,
                discountAmount: 0,
            });
            yield cart.save();
        }
        return cart;
    }
});
// Create a new coupon
const createCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const couponData = coupon_validation_1.createCouponValidation.parse(req.body);
        // Explicitly validate incoming IDs
        if (!mongoose_1.default.Types.ObjectId.isValid(couponData.restaurantId)) {
            return next(new appError_1.appError("The provided Restaurant ID is not a valid format.", 400));
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || !mongoose_1.default.Types.ObjectId.isValid(req.user._id)) {
            return next(new appError_1.appError("Authentication error: Vendor ID is invalid.", 401));
        }
        // Check if hotel belongs to the vendor
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: couponData.restaurantId,
            vendorId: req.user._id
        });
        if (!hotel) {
            return next(new appError_1.appError("Restaurant not found or you do not have permission to add coupons to it.", 404));
        }
        // Check if coupon code already exists for this vendor
        const existingCoupon = yield coupon_model_1.Coupon.findOne({
            couponCode: couponData.couponCode,
            vendorId: req.user._id
        });
        if (existingCoupon) {
            return next(new appError_1.appError("You have already created a coupon with this code.", 400));
        }
        const coupon = new coupon_model_1.Coupon(Object.assign(Object.assign({}, couponData), { vendorId: req.user._id }));
        yield coupon.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Coupon created successfully",
            data: coupon,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return next(new appError_1.appError(`Validation Error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400));
        }
        if (error instanceof mongoose_1.default.Error.CastError) {
            return next(new appError_1.appError(`Invalid ID format for field '${error.path}'. Value: '${error.value}'`, 400));
        }
        next(error);
    }
});
exports.createCoupon = createCoupon;
// Get all coupons for a vendor
const getVendorCoupons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield coupon_model_1.Coupon.find({ vendorId: req.user._id })
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Coupons retrieved successfully",
            data: coupons,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorCoupons = getVendorCoupons;
// Update a coupon
const updateCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couponId = req.params.id;
        const couponData = coupon_validation_1.updateCouponValidation.parse(req.body);
        const coupon = yield coupon_model_1.Coupon.findOne({
            _id: couponId,
            vendorId: req.user._id
        });
        if (!coupon) {
            return next(new appError_1.appError("Coupon not found or you do not have permission to edit it.", 404));
        }
        // If restaurant is being changed, verify it belongs to the vendor
        if (couponData.restaurantId) {
            const hotel = yield hotel_model_1.Hotel.findOne({
                _id: couponData.restaurantId,
                vendorId: req.user._id
            });
            if (!hotel) {
                return next(new appError_1.appError("Restaurant not found or you do not have permission to assign this coupon to it.", 404));
            }
        }
        const updatedCoupon = yield coupon_model_1.Coupon.findByIdAndUpdate(couponId, couponData, { new: true });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Coupon updated successfully",
            data: updatedCoupon,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCoupon = updateCoupon;
// Delete a coupon
const deleteCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couponId = req.params.id;
        const coupon = yield coupon_model_1.Coupon.findOneAndDelete({
            _id: couponId,
            vendorId: req.user._id
        });
        if (!coupon) {
            return next(new appError_1.appError("Coupon not found or you do not have permission to delete it.", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Coupon deleted successfully",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCoupon = deleteCoupon;
// Apply coupon to cart
const applyCouponToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { couponCode } = req.body;
        if (!couponCode) {
            return next(new appError_1.appError("Coupon code is required.", 400));
        }
        // Find cart using the same logic as other controllers
        const cart = yield getCartForRequest(req);
        if (!cart || cart.items.length === 0) {
            return next(new appError_1.appError("Your cart is empty.", 400));
        }
        // Find coupon
        const coupon = yield coupon_model_1.Coupon.findOne({
            couponCode: couponCode.toUpperCase(),
            isActive: true
        });
        if (!coupon) {
            return next(new appError_1.appError("Invalid or inactive coupon code.", 404));
        }
        // --- Start Validation ---
        // 1. Restaurant validation
        const restaurantIdInCart = cart.items[0].hotelId.toString();
        if (coupon.restaurantId.toString() !== restaurantIdInCart) {
            return next(new appError_1.appError("This coupon is not valid for the items in your cart.", 400));
        }
        // 2. Date validation
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return next(new appError_1.appError("This coupon has expired or is not yet active.", 400));
        }
        // 3. Usage limit validation
        if (coupon.totalUses >= coupon.usageLimit) {
            return next(new appError_1.appError("This coupon has reached its usage limit.", 400));
        }
        // 4. Per-user usage limit
        const userUses = coupon.usedBy.filter(id => id.toString() === req.user._id.toString()).length;
        if (userUses >= coupon.usagePerUser) {
            return next(new appError_1.appError("You have already used this coupon the maximum number of times.", 400));
        }
        // 5. Minimum order amount
        if (cart.totalAmount < coupon.minOrderAmount) {
            return next(new appError_1.appError(`Minimum order amount of ₹${coupon.minOrderAmount} is required to use this coupon.`, 400));
        }
        // --- End Validation ---
        // Calculate discount
        const discount = (cart.totalAmount * coupon.discountPercentage) / 100;
        const finalDiscount = Math.min(discount, coupon.maxDiscountAmount);
        // Apply discount to cart
        cart.appliedCouponCode = coupon.couponCode;
        cart.discountAmount = finalDiscount;
        yield cart.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Coupon applied successfully.",
            data: {
                cart,
                discountAmount: finalDiscount
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.applyCouponToCart = applyCouponToCart;
// Remove coupon from cart
const removeCouponFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find cart using the same logic as other controllers
        const cart = yield getCartForRequest(req);
        if (!cart) {
            return next(new appError_1.appError("Cart not found.", 404));
        }
        cart.appliedCouponCode = undefined;
        cart.discountAmount = 0;
        yield cart.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Coupon removed.",
            data: { cart },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeCouponFromCart = removeCouponFromCart;
