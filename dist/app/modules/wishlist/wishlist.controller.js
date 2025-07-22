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
exports.getWishlistSummary = exports.checkItemInWishlist = exports.clearWishlist = exports.updateWishlistItem = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const wishlist_model_1 = require("./wishlist.model");
const product_model_1 = require("../product/product.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
// Get user's wishlist
const getWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { page = 1, limit = 10, sort = '-addedAt', category, search } = req.query;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Find or create user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOrCreateUserWishlist(userId);
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
                    _id: wishlist === null || wishlist === void 0 ? void 0 : wishlist._id,
                    user: userId,
                    items: [],
                    totalItems: 0,
                },
            });
            return;
        }
        // Build aggregation pipeline for filtering and pagination
        const pipeline = [
            { $match: { user: new mongoose_1.default.Types.ObjectId(userId), isDeleted: false } },
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
                        { 'categoryDetails._id': new mongoose_1.default.Types.ObjectId(category) },
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
        const [items, totalResult] = yield Promise.all([
            wishlist_model_1.Wishlist.aggregate(pipeline),
            wishlist_model_1.Wishlist.aggregate(totalPipeline),
        ]);
        const total = ((_b = totalResult[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
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
    }
    catch (error) {
        next(error);
    }
});
exports.getWishlist = getWishlist;
// Add item to wishlist
const addToWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId, notes } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate product ID
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Check if product exists and is active
        const product = yield product_model_1.Product.findOne({
            _id: productId,
            isDeleted: false,
            status: 'active',
        });
        if (!product) {
            next(new appError_1.appError('Product not found or inactive', 404));
            return;
        }
        // Find or create user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOrCreateUserWishlist(userId);
        // Add item to wishlist
        yield wishlist.addItem(productId, notes);
        // Get updated wishlist with populated product details
        const updatedWishlist = yield wishlist_model_1.Wishlist.findById(wishlist._id)
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
    }
    catch (error) {
        next(error);
    }
});
exports.addToWishlist = addToWishlist;
// Remove item from wishlist
const removeFromWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId } = req.params;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate product ID
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Find user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ user: userId, isDeleted: false });
        if (!wishlist) {
            next(new appError_1.appError('Wishlist not found', 404));
            return;
        }
        // Check if item exists in wishlist
        if (!wishlist.hasItem(productId)) {
            next(new appError_1.appError('Item not found in wishlist', 404));
            return;
        }
        // Remove item from wishlist
        yield wishlist.removeItem(productId);
        // Get updated wishlist with populated product details
        const updatedWishlist = yield wishlist_model_1.Wishlist.findById(wishlist._id)
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
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromWishlist = removeFromWishlist;
// Update wishlist item notes
const updateWishlistItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId } = req.params;
        const { notes } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate product ID
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Find user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ user: userId, isDeleted: false });
        if (!wishlist) {
            next(new appError_1.appError('Wishlist not found', 404));
            return;
        }
        // Check if item exists in wishlist
        if (!wishlist.hasItem(productId)) {
            next(new appError_1.appError('Item not found in wishlist', 404));
            return;
        }
        // Update item notes
        yield wishlist.updateItemNotes(productId, notes || '');
        // Get updated wishlist with populated product details
        const updatedWishlist = yield wishlist_model_1.Wishlist.findById(wishlist._id)
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
    }
    catch (error) {
        next(error);
    }
});
exports.updateWishlistItem = updateWishlistItem;
// Clear entire wishlist
const clearWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Find user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ user: userId, isDeleted: false });
        if (!wishlist) {
            next(new appError_1.appError('Wishlist not found', 404));
            return;
        }
        // Clear wishlist
        yield wishlist.clearWishlist();
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
    }
    catch (error) {
        next(error);
    }
});
exports.clearWishlist = clearWishlist;
// Check if item is in wishlist
const checkItemInWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { productId } = req.params;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate product ID
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Find user wishlist
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ user: userId, isDeleted: false });
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
    }
    catch (error) {
        next(error);
    }
});
exports.checkItemInWishlist = checkItemInWishlist;
// Get wishlist summary
const getWishlistSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Find user wishlist with populated products
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ user: userId, isDeleted: false })
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
        const recentlyAdded = wishlist.items.filter(item => item.addedAt >= sevenDaysAgo).length;
        // Category breakdown
        const categoryMap = new Map();
        const prices = [];
        wishlist.items.forEach(item => {
            var _a;
            const product = item.product;
            if (product && !product.isDeleted && product.status === 'active') {
                // Price tracking
                prices.push(product.price);
                // Category tracking
                if (product.category) {
                    const categoryId = ((_a = product.category._id) === null || _a === void 0 ? void 0 : _a.toString()) || product.category.toString();
                    const categoryName = product.category.name || 'Unknown';
                    if (categoryMap.has(categoryId)) {
                        categoryMap.get(categoryId).itemCount++;
                    }
                    else {
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
    }
    catch (error) {
        next(error);
    }
});
exports.getWishlistSummary = getWishlistSummary;
