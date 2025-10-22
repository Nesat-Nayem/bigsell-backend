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
exports.getProductFilters = exports.searchProducts = exports.getProductsByCategory = exports.getNewArrivalProducts = exports.getTrendingProducts = exports.getFeaturedProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.getProductBySlug = exports.getWeeklyDiscountProducts = exports.getWeeklyBestSellingProducts = exports.getDiscountProducts = exports.getProductSummary = exports.getVendorProductSummary = exports.getManageProducts = exports.createProduct = void 0;
const product_model_1 = require("./product.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
const product_category_model_1 = require("../Product-category/product-category.model");
// Create a new product
const slugify = (text) => text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = req.body;
        const actingUser = req.user;
        // If a vendor is creating the product, force-assign vendor field to the acting user
        if ((actingUser === null || actingUser === void 0 ? void 0 : actingUser.role) === "vendor") {
            productData.vendor = actingUser._id;
        }
        // Check if SKU already exists
        const existingSku = yield product_model_1.Product.findOne({
            sku: productData.sku,
            isDeleted: false,
        });
        if (existingSku) {
            next(new appError_1.appError("Product with this SKU already exists", 400));
            return;
        }
        // Generate slug if not provided
        if (!productData.slug && productData.name) {
            const base = slugify(productData.name);
            let candidate = base;
            let i = 1;
            while (yield product_model_1.Product.findOne({ slug: candidate })) {
                candidate = `${base}-${i++}`;
            }
            productData.slug = candidate;
        }
        const result = yield product_model_1.Product.create(productData);
        const populatedResult = yield product_model_1.Product.findById(result._id)
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
    }
    catch (error) {
        next(error);
    }
});
exports.createProduct = createProduct;
// Get products for management (admin sees all; vendor sees only their products)
const getManageProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actingUser = req.user;
        const { page = 1, limit = 10, sort = "createdAt", order = "desc", category, subcategory, brand, minPrice, maxPrice, inStock, status, isFeatured, isTrending, isNewArrival, isDiscount, isWeeklyBestSelling, isWeeklyDiscount, colors, sizes, rating, search, vendor, } = req.query;
        const filter = { isDeleted: false };
        // Vendor scoping
        if ((actingUser === null || actingUser === void 0 ? void 0 : actingUser.role) === "vendor") {
            filter.vendor = actingUser._id;
        }
        else if (vendor) {
            filter.vendor = vendor;
        }
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (subcategory)
            filter.subcategory = new RegExp(String(subcategory), "i");
        if (brand)
            filter.brand = new RegExp(String(brand), "i");
        if (isFeatured !== undefined)
            filter.isFeatured = String(isFeatured) === "true";
        if (isTrending !== undefined)
            filter.isTrending = String(isTrending) === "true";
        if (isNewArrival !== undefined)
            filter.isNewArrival = String(isNewArrival) === "true";
        if (isDiscount !== undefined)
            filter.isDiscount = String(isDiscount) === "true";
        if (isWeeklyBestSelling !== undefined)
            filter.isWeeklyBestSelling = String(isWeeklyBestSelling) === "true";
        if (isWeeklyDiscount !== undefined)
            filter.isWeeklyDiscount = String(isWeeklyDiscount) === "true";
        if (inStock !== undefined) {
            filter.stock = String(inStock) === "true" ? { $gt: 0 } : 0;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
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
        const sortObj = {};
        sortObj[String(sort)] = sortOrder;
        const skip = (Number(page) - 1) * Number(limit);
        const [rawProducts, total] = yield Promise.all([
            product_model_1.Product.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
        ]);
        const catIds = Array.from(new Set(rawProducts
            .map((p) => p.category)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const subIds = Array.from(new Set(rawProducts
            .map((p) => p.subcategory)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const subSubIds = Array.from(new Set(rawProducts
            .map((p) => p.subSubcategory)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const [catDocs, subDocs, subSubDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const subSubMap = new Map(subSubDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            const subSubId = p.subSubcategory ? String(p.subSubcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            if (subSubId && subSubMap.has(subSubId))
                out.subSubcategory = { _id: subSubId, title: subSubMap.get(subSubId) };
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
    }
    catch (error) {
        next(error);
    }
});
exports.getManageProducts = getManageProducts;
// Get vendor product summary/statistics (vendor scoped)
const getVendorProductSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actingUser = req.user;
        if (!(actingUser === null || actingUser === void 0 ? void 0 : actingUser._id)) {
            next(new appError_1.appError("User not authenticated", 401));
            return;
        }
        const vendorId = actingUser._id;
        const [totalProducts, activeProducts, inactiveProducts, outOfStock, lowStock,] = yield Promise.all([
            product_model_1.Product.countDocuments({ isDeleted: false, vendor: vendorId }),
            product_model_1.Product.countDocuments({ status: "active", isDeleted: false, vendor: vendorId }),
            product_model_1.Product.countDocuments({ status: "inactive", isDeleted: false, vendor: vendorId }),
            product_model_1.Product.countDocuments({ isDeleted: false, vendor: vendorId, $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }] }),
            product_model_1.Product.countDocuments({ isDeleted: false, vendor: vendorId, $expr: { $lte: ["$stock", { $ifNull: ["$minStock", 0] }] } }),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorProductSummary = getVendorProductSummary;
// Get product summary/statistics (admin only)
const getProductSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalProducts, activeProducts, inactiveProducts, outOfStock, lowStock,] = yield Promise.all([
            product_model_1.Product.countDocuments({ isDeleted: false }),
            product_model_1.Product.countDocuments({ status: "active", isDeleted: false }),
            product_model_1.Product.countDocuments({ status: "inactive", isDeleted: false }),
            product_model_1.Product.countDocuments({ isDeleted: false, $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }] }),
            product_model_1.Product.countDocuments({ isDeleted: false, $expr: { $lte: ["$stock", { $ifNull: ["$minStock", 0] }] } }),
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
    }
    catch (error) {
        next(error);
    }
});
exports.getProductSummary = getProductSummary;
// Get discount products
const getDiscountProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const rawProducts = yield product_model_1.Product.find({
            discount: { $gt: 0 },
            status: "active",
            isDeleted: false,
        })
            .sort({ discount: -1, createdAt: -1 })
            .limit(Number(limit))
            .lean();
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subSubIds = Array.from(new Set(rawProducts.map((p) => p.subSubcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs, subSubDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const subSubMap = new Map(subSubDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            const subSubId = p.subSubcategory ? String(p.subSubcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            if (subSubId && subSubMap.has(subSubId))
                out.subSubcategory = { _id: subSubId, title: subSubMap.get(subSubId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Discount products retrieved successfully",
            data: products,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getDiscountProducts = getDiscountProducts;
// Get weekly best selling products
const getWeeklyBestSellingProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const rawProducts = yield product_model_1.Product.find({
            isWeeklyBestSelling: true,
            status: "active",
            isDeleted: false,
        })
            .sort({ reviewCount: -1, rating: -1 })
            .limit(Number(limit))
            .lean();
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Weekly best selling products retrieved successfully",
            data: products,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getWeeklyBestSellingProducts = getWeeklyBestSellingProducts;
// Get weekly discount products
const getWeeklyDiscountProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const rawProducts = yield product_model_1.Product.find({
            isWeeklyDiscount: true,
            status: "active",
            isDeleted: false,
        })
            .sort({ discount: -1, createdAt: -1 })
            .limit(Number(limit))
            .lean();
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Weekly discount products retrieved successfully",
            data: products,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getWeeklyDiscountProducts = getWeeklyDiscountProducts;
// Get single product by slug
const getProductBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const product = yield product_model_1.Product.findOne({ slug, isDeleted: false })
            .populate("category", "title")
            .populate("subcategory", "title")
            .populate("subSubcategory", "title")
            .lean();
        if (!product) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product retrieved successfully",
            data: product,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getProductBySlug = getProductBySlug;
// Get all products with filtering, sorting, and pagination
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort = "createdAt", order = "desc", category, subcategory, subSubcategory, brand, minPrice, maxPrice, inStock, status = "active", isFeatured, isTrending, isNewArrival, isDiscount, isWeeklyBestSelling, isWeeklyDiscount, colors, sizes, rating, search, } = req.query;
        // Build filter object
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (category) {
            if (!mongoose_1.default.Types.ObjectId.isValid(String(category))) {
                next(new appError_1.appError("Invalid category ID", 400));
                return;
            }
            filter.category = category;
        }
        if (subcategory) {
            if (!mongoose_1.default.Types.ObjectId.isValid(String(subcategory))) {
                next(new appError_1.appError("Invalid subcategory ID", 400));
                return;
            }
            filter.subcategory = subcategory;
        }
        if (subSubcategory) {
            if (!mongoose_1.default.Types.ObjectId.isValid(String(subSubcategory))) {
                next(new appError_1.appError("Invalid sub-subcategory ID", 400));
                return;
            }
            filter.subSubcategory = subSubcategory;
        }
        if (brand)
            filter.brand = new RegExp(brand, "i");
        if (isFeatured !== undefined)
            filter.isFeatured = isFeatured === "true";
        if (isTrending !== undefined)
            filter.isTrending = isTrending === "true";
        if (isNewArrival !== undefined)
            filter.isNewArrival = isNewArrival === "true";
        if (isDiscount !== undefined)
            filter.isDiscount = isDiscount === "true";
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
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        // Colors filter
        if (colors) {
            const colorArray = colors.split(",");
            filter.colors = { $in: colorArray };
        }
        // Sizes filter
        if (sizes) {
            const sizeArray = sizes.split(",");
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
        const sortOrder = order === "asc" ? 1 : -1;
        const sortObj = {};
        sortObj[sort] = sortOrder;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const [rawProducts, total] = yield Promise.all([
            product_model_1.Product.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
        ]);
        // Manually map category and subcategory titles without triggering cast errors
        const catIds = Array.from(new Set(rawProducts
            .map((p) => p.category)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const subIds = Array.from(new Set(rawProducts
            .map((p) => p.subcategory)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const subSubIds = Array.from(new Set(rawProducts
            .map((p) => p.subSubcategory)
            .filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id)))
            .map((id) => String(id))));
        const [catDocs, subDocs, subSubDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subSubIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const subSubMap = new Map(subSubDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
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
            next(new appError_1.appError("Invalid product ID", 400));
            return;
        }
        const product = yield product_model_1.Product.findOne({ _id: id, isDeleted: false })
            .populate("category", "title")
            .populate("subcategory", "title")
            .populate("subSubcategory", "title")
            .lean();
        if (!product) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product retrieved successfully",
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
        const actingUser = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError("Invalid product ID", 400));
            return;
        }
        // Check if product exists
        const existingProduct = yield product_model_1.Product.findOne({
            _id: id,
            isDeleted: false,
        });
        if (!existingProduct) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        // Vendors can only update their own products
        if ((actingUser === null || actingUser === void 0 ? void 0 : actingUser.role) === "vendor") {
            if (String(existingProduct.vendor) !== String(actingUser._id)) {
                next(new appError_1.appError("You do not have permission to update this product", 403));
                return;
            }
            // Ensure vendor field cannot be changed by vendor to another vendor
            if (updateData.vendor && String(updateData.vendor) !== String(actingUser._id)) {
                updateData.vendor = actingUser._id;
            }
        }
        // Check if SKU is being updated and if it already exists
        if (updateData.sku && updateData.sku !== existingProduct.sku) {
            const existingSku = yield product_model_1.Product.findOne({
                sku: updateData.sku,
                isDeleted: false,
                _id: { $ne: id },
            });
            if (existingSku) {
                next(new appError_1.appError("Product with this SKU already exists", 400));
                return;
            }
        }
        // Handle slug regeneration if name changed and no explicit slug provided
        if (!updateData.slug &&
            updateData.name &&
            updateData.name !== existingProduct.name) {
            const base = slugify(updateData.name);
            let candidate = base;
            let i = 1;
            while (yield product_model_1.Product.findOne({ slug: candidate, _id: { $ne: id } })) {
                candidate = `${base}-${i++}`;
            }
            updateData.slug = candidate;
        }
        else if (updateData.slug) {
            // If slug provided, ensure it's unique
            const base = slugify(updateData.slug);
            let candidate = base;
            let i = 1;
            while (yield product_model_1.Product.findOne({ slug: candidate, _id: { $ne: id } })) {
                candidate = `${base}-${i++}`;
            }
            updateData.slug = candidate;
        }
        const result = yield product_model_1.Product.findByIdAndUpdate(id, updateData, {
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
        const actingUser = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError("Invalid product ID", 400));
            return;
        }
        // If vendor, verify ownership before deletion
        if ((actingUser === null || actingUser === void 0 ? void 0 : actingUser.role) === "vendor") {
            const existingProduct = yield product_model_1.Product.findOne({ _id: id, isDeleted: false });
            if (!existingProduct) {
                next(new appError_1.appError("Product not found", 404));
                return;
            }
            if (String(existingProduct.vendor) !== String(actingUser._id)) {
                next(new appError_1.appError("You do not have permission to delete this product", 403));
                return;
            }
        }
        const result = yield product_model_1.Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product deleted successfully",
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
        const rawProducts = yield product_model_1.Product.find({
            isFeatured: true,
            status: "active",
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();
        // Map titles safely
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Featured products retrieved successfully",
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
        const rawProducts = yield product_model_1.Product.find({
            isTrending: true,
            status: "active",
            isDeleted: false,
        })
            .sort({ rating: -1, reviewCount: -1 })
            .limit(Number(limit))
            .lean();
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Trending products retrieved successfully",
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
        const rawProducts = yield product_model_1.Product.find({
            isNewArrival: true,
            status: "active",
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();
        const catIds = Array.from(new Set(rawProducts.map((p) => p.category).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const subIds = Array.from(new Set(rawProducts.map((p) => p.subcategory).filter((id) => id && mongoose_1.default.Types.ObjectId.isValid(String(id))).map(String)));
        const [catDocs, subDocs] = yield Promise.all([
            product_category_model_1.ProductCategory.find({ _id: { $in: catIds } }, { _id: 1, title: 1 }).lean(),
            product_category_model_1.ProductCategory.find({ _id: { $in: subIds } }, { _id: 1, title: 1 }).lean(),
        ]);
        const catMap = new Map(catDocs.map((c) => [String(c._id), c.title]));
        const subMap = new Map(subDocs.map((c) => [String(c._id), c.title]));
        const products = rawProducts.map((p) => {
            const out = Object.assign({}, p);
            const catId = p.category ? String(p.category) : null;
            const subId = p.subcategory ? String(p.subcategory) : null;
            if (catId && catMap.has(catId))
                out.category = { _id: catId, title: catMap.get(catId) };
            if (subId && subMap.has(subId))
                out.subcategory = { _id: subId, title: subMap.get(subId) };
            return out;
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "New arrival products retrieved successfully",
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
        const { page = 1, limit = 10, sort = "createdAt", order = "desc", } = req.query;
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            next(new appError_1.appError("Invalid category ID", 400));
            return;
        }
        const filter = {
            category: categoryId,
            status: "active",
            isDeleted: false,
        };
        const sortOrder = order === "asc" ? 1 : -1;
        const sortObj = {};
        sortObj[sort] = sortOrder;
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = yield Promise.all([
            product_model_1.Product.find(filter)
                .populate("category", "title")
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
            next(new appError_1.appError("Search query is required", 400));
            return;
        }
        const filter = {
            $text: { $search: q },
            status: "active",
            isDeleted: false,
        };
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = yield Promise.all([
            product_model_1.Product.find(filter, { score: { $meta: "textScore" } })
                .populate("category", "title")
                .populate("subcategory", "title")
                .sort({ score: { $meta: "textScore" } })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            product_model_1.Product.countDocuments(filter),
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
            product_model_1.Product.distinct("brand", { status: "active", isDeleted: false }),
            product_model_1.Product.distinct("colors", { status: "active", isDeleted: false }),
            product_model_1.Product.distinct("sizes", { status: "active", isDeleted: false }),
            product_model_1.Product.aggregate([
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
    }
    catch (error) {
        next(error);
    }
});
exports.getProductFilters = getProductFilters;
