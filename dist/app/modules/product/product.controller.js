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
exports.deleteProductById = exports.updateProductById = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const product_model_1 = require("./product.model");
const product_validation_1 = require("./product.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const category_model_1 = require("../category/category.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, description, category, sizes, addons } = req.body;
        // Check if product with same name already exists
        const existingProduct = yield product_model_1.Product.findOne({ name, isDeleted: false });
        if (existingProduct) {
            next(new appError_1.appError("Product with this name already exists", 400));
            return;
        }
        // Check if category exists
        const categoryExists = yield category_model_1.Category.findOne({ _id: category, isDeleted: false });
        if (!categoryExists) {
            next(new appError_1.appError("Category not found", 404));
            return;
        }
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("Image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Parse JSON for sizes and addons if they're sent as strings
        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        const parsedAddons = typeof addons === 'string' ? JSON.parse(addons) : addons || [];
        // Validate the input
        const validatedData = product_validation_1.productValidation.parse({
            name,
            description,
            image,
            category,
            sizes: parsedSizes,
            addons: parsedAddons
        });
        // Create a new product
        const product = new product_model_1.Product(validatedData);
        yield product.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Product created successfully",
            data: product,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-products/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createProduct = createProduct;
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, search } = req.query;
        const filter = { isDeleted: false };
        // Add category filter if provided
        if (category && mongoose_1.default.Types.ObjectId.isValid(category)) {
            filter.category = category;
        }
        // Add search filter if provided
        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        const products = yield product_model_1.Product.find(filter)
            .populate('category', 'title')
            .sort({ createdAt: -1 });
        if (products.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No products found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Products retrieved successfully",
            data: products,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.Product.findOne({
            _id: req.params.id,
            isDeleted: false
        }).populate('category', 'title');
        if (!product) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        res.json({
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
const updateProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const productId = req.params.id;
        const { name, description, category, sizes, addons } = req.body;
        // Find the product to update
        const product = yield product_model_1.Product.findOne({
            _id: productId,
            isDeleted: false
        });
        if (!product) {
            next(new appError_1.appError("Product not found", 404));
        }
        // Prepare update data
        const updateData = {};
        if (name) {
            // Check if new name already exists
            if (name !== (product === null || product === void 0 ? void 0 : product.name)) {
                const existingProduct = yield product_model_1.Product.findOne({
                    name,
                    isDeleted: false,
                    _id: { $ne: productId }
                });
                if (existingProduct) {
                    next(new appError_1.appError("Product with this name already exists", 400));
                }
            }
            updateData.name = name;
        }
        if (description) {
            updateData.description = description;
        }
        if (category) {
            // Check if category exists
            const categoryExists = yield category_model_1.Category.findOne({ _id: category, isDeleted: false });
            if (!categoryExists) {
                next(new appError_1.appError("Category not found", 404));
                return;
            }
            updateData.category = category;
        }
        if (sizes) {
            // Parse JSON if sizes is sent as a string
            const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            updateData.sizes = parsedSizes;
        }
        if (addons) {
            // Parse JSON if addons is sent as a string
            const parsedAddons = typeof addons === 'string' ? JSON.parse(addons) : addons;
            updateData.addons = parsedAddons;
        }
        // If there's a new image
        if (req.file) {
            updateData.image = req.file.path;
            // Delete the old image from cloudinary if it exists
            if (product === null || product === void 0 ? void 0 : product.image) {
                const publicId = (_a = product === null || product === void 0 ? void 0 : product.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-products/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = product_validation_1.productUpdateValidation.parse(updateData);
            // Update the product
            const updatedProduct = yield product_model_1.Product.findByIdAndUpdate(productId, validatedData, { new: true }).populate('category', 'title');
            res.json({
                success: true,
                statusCode: 200,
                message: "Product updated successfully",
                data: updatedProduct,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: product,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-products/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateProductById = updateProductById;
const deleteProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.Product.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!product) {
            next(new appError_1.appError("Product not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Product deleted successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProductById = deleteProductById;
