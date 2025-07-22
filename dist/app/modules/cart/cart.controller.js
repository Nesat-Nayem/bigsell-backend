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
exports.getCartSummary = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cart_model_1 = require("./cart.model");
const product_model_1 = require("../product/product.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
// Get user's cart
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { populate = 'true' } = req.query;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        let cart;
        if (populate === 'true') {
            cart = yield cart_model_1.Cart.findUserCart(userId);
        }
        else {
            cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
        }
        if (!cart) {
            // Create empty cart if doesn't exist
            cart = yield cart_model_1.Cart.create({ user: userId, items: [] });
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Cart retrieved successfully',
            data: cart,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getCart = getCart;
// Add item to cart
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId, quantity, selectedColor, selectedSize } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Check if product exists and is available
        const product = yield product_model_1.Product.findOne({
            _id: productId,
            isDeleted: false,
            status: 'active'
        });
        if (!product) {
            next(new appError_1.appError('Product not found or unavailable', 404));
            return;
        }
        // Check stock availability
        if (product.stock < quantity) {
            next(new appError_1.appError(`Only ${product.stock} items available in stock`, 400));
            return;
        }
        // Check if selected color/size is available
        if (selectedColor && !product.colors.includes(selectedColor)) {
            next(new appError_1.appError('Selected color is not available', 400));
            return;
        }
        if (selectedSize && !product.sizes.includes(selectedSize)) {
            next(new appError_1.appError('Selected size is not available', 400));
            return;
        }
        // Find or create user's cart
        let cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
        if (!cart) {
            cart = new cart_model_1.Cart({ user: userId, items: [] });
        }
        // Add item to cart
        yield cart.addItem(productId, quantity, product.price, selectedColor, selectedSize);
        // Populate the cart with product details
        const populatedCart = yield cart_model_1.Cart.findUserCart(userId);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Item added to cart successfully',
            data: populatedCart,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.addToCart = addToCart;
// Update cart item quantity
const updateCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId } = req.params;
        const { quantity, selectedColor, selectedSize } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Find user's cart
        const cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
        if (!cart) {
            next(new appError_1.appError('Cart not found', 404));
            return;
        }
        // Check if product exists and is available
        const product = yield product_model_1.Product.findOne({
            _id: productId,
            isDeleted: false,
            status: 'active'
        });
        if (!product) {
            next(new appError_1.appError('Product not found or unavailable', 404));
            return;
        }
        // Check stock availability
        if (product.stock < quantity) {
            next(new appError_1.appError(`Only ${product.stock} items available in stock`, 400));
            return;
        }
        // Update item in cart
        yield cart.updateItem(productId, quantity, selectedColor, selectedSize);
        // Get updated cart with populated data
        const updatedCart = yield cart_model_1.Cart.findUserCart(userId);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Cart item updated successfully',
            data: updatedCart,
        });
        return;
    }
    catch (error) {
        if (error instanceof Error && error.message === 'Item not found in cart') {
            next(new appError_1.appError('Item not found in cart', 404));
            return;
        }
        next(error);
    }
});
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId } = req.params;
        const { selectedColor, selectedSize } = req.query;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Find user's cart
        const cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
        if (!cart) {
            next(new appError_1.appError('Cart not found', 404));
            return;
        }
        // Remove item from cart
        yield cart.removeItem(productId, selectedColor, selectedSize);
        // Get updated cart with populated data
        const updatedCart = yield cart_model_1.Cart.findUserCart(userId);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Item removed from cart successfully',
            data: updatedCart,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromCart = removeFromCart;
// Clear entire cart
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Find user's cart
        const cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
        if (!cart) {
            next(new appError_1.appError('Cart not found', 404));
            return;
        }
        // Clear all items from cart
        yield cart.clearCart();
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
    }
    catch (error) {
        next(error);
    }
});
exports.clearCart = clearCart;
// Get cart summary (lightweight version)
const getCartSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        const cart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
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
    }
    catch (error) {
        next(error);
    }
});
exports.getCartSummary = getCartSummary;
