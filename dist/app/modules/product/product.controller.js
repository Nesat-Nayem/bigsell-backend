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
exports.getProductFilters = exports.searchProducts = exports.getProductsByCategory = exports.getNewArrivalProducts = exports.getTrendingProducts = exports.getFeaturedProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const product_model_1 = require("./product.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
// Create a new product
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = req.body;
        // Check if SKU already exists
        const existingSku = yield product_model_1.Product.findOne({ sku: productData.sku, isDeleted: false });
        if (existingSku) {
            next(new appError_1.appError('Product with this SKU already exists', 400));
            return;
        }
        const result = yield product_model_1.Product.create(productData);
        const populatedResult = yield product_model_1.Product.findById(result._id).populate('category', 'title');
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Product created successfully',
            data: populatedResult,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createProduct = createProduct;
// Get all products with filtering, sorting, and pagination
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', category, subcategory, brand, minPrice, maxPrice, inStock, status = 'active', isFeatured, isTrending, isNewArrival, colors, sizes, rating, search, } = req.query;
        // Build filter object
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (subcategory)
            filter.subcategory = new RegExp(subcategory, 'i');
        if (brand)
            filter.brand = new RegExp(brand, 'i');
        if (isFeatured !== undefined)
            filter.isFeatured = isFeatured === 'true';
        if (isTrending !== undefined)
            filter.isTrending = isTrending === 'true';
        if (isNewArrival !== undefined)
            filter.isNewArrival = isNewArrival === 'true';
        if (inStock !== undefined) {
            filter.stock = inStock === 'true' ? { $gt: 0 } : 0;
        }
        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        // Colors filter
        if (colors) {
            const colorArray = colors.split(',');
            filter.colors = { $in: colorArray };
        }
        // Sizes filter
        if (sizes) {
            const sizeArray = sizes.split(',');
            filter.sizes = { $in: sizeArray };
        }
        // Rating filter
        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }
        // Search filter
        if (search) {
            filter.$text = { $search: search };
        }
        // Sorting
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = {};
        sortObj[sort] = sortOrder;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = yield Promise.all([
            product_model_1.Product.find(filter)
                .populate('category', 'title')
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
// Get single product by ID
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        const product = yield product_model_1.Product.findOne({ _id: id, isDeleted: false })
            .populate('category', 'title')
            .lean();
        if (!product) {
            next(new appError_1.appError('Product not found', 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Product retrieved successfully',
            data: product,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getProductById = getProductById;
// Update product
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        // Check if product exists
        const existingProduct = yield product_model_1.Product.findOne({ _id: id, isDeleted: false });
        if (!existingProduct) {
            next(new appError_1.appError('Product not found', 404));
            return;
        }
        // Check if SKU is being updated and if it already exists
        if (updateData.sku && updateData.sku !== existingProduct.sku) {
            const existingSku = yield product_model_1.Product.findOne({
                sku: updateData.sku,
                isDeleted: false,
                _id: { $ne: id }
            });
            if (existingSku) {
                next(new appError_1.appError('Product with this SKU already exists', 400));
                return;
            }
        }
        const result = yield product_model_1.Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('category', 'title');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Product updated successfully',
            data: result,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateProduct = updateProduct;
// Delete product (soft delete)
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid product ID', 400));
            return;
        }
        const result = yield product_model_1.Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            next(new appError_1.appError('Product not found', 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Product deleted successfully',
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProduct = deleteProduct;
// Get featured products
const getFeaturedProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const products = yield product_model_1.Product.find({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getFeaturedProducts = getFeaturedProducts;
// Get trending products
const getTrendingProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const products = yield product_model_1.Product.find({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getTrendingProducts = getTrendingProducts;
// Get new arrival products
const getNewArrivalProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const products = yield product_model_1.Product.find({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getNewArrivalProducts = getNewArrivalProducts;
// Get products by category
const getProductsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            next(new appError_1.appError('Invalid category ID', 400));
            return;
        }
        const filter = {
            category: categoryId,
            status: 'active',
            isDeleted: false,
        };
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = {};
        sortObj[sort] = sortOrder;
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = yield Promise.all([
            product_model_1.Product.find(filter)
                .populate('category', 'title')
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getProductsByCategory = getProductsByCategory;
// Search products
const searchProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
            next(new appError_1.appError('Search query is required', 400));
            return;
        }
        const filter = {
            $text: { $search: q },
            status: 'active',
            isDeleted: false,
        };
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = yield Promise.all([
            product_model_1.Product.find(filter, { score: { $meta: 'textScore' } })
                .populate('category', 'title')
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
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
    }
    catch (error) {
        next(error);
    }
});
exports.searchProducts = searchProducts;
// Get product filters (for frontend filter options)
const getProductFilters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [brands, colors, sizes, priceRange] = yield Promise.all([
            product_model_1.Product.distinct('brand', { status: 'active', isDeleted: false }),
            product_model_1.Product.distinct('colors', { status: 'active', isDeleted: false }),
            product_model_1.Product.distinct('sizes', { status: 'active', isDeleted: false }),
            product_model_1.Product.aggregate([
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
    }
    catch (error) {
        next(error);
    }
});
exports.getProductFilters = getProductFilters;
