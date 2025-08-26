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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogCategory = exports.updateBlogCategory = exports.getBlogCategoryById = exports.getBlogCategories = exports.createBlogCategory = void 0;
const blog_category_model_1 = require("./blog-category.model");
const blog_category_validation_1 = require("./blog-category.validation");
const appError_1 = require("../../errors/appError");
const createBlogCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryName, status } = req.body;
        const exists = yield blog_category_model_1.BlogCategory.findOne({ categoryName: categoryName === null || categoryName === void 0 ? void 0 : categoryName.trim(), isDeleted: false });
        if (exists) {
            return next(new appError_1.appError('Category with this name already exists', 400));
        }
        const validated = blog_category_validation_1.blogCategoryValidation.parse({ categoryName, status });
        const category = yield blog_category_model_1.BlogCategory.create(validated);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Blog category created successfully',
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createBlogCategory = createBlogCategory;
const getBlogCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const query = { isDeleted: false };
        if (status === 'active')
            query.status = 'Active';
        if (status === 'inactive')
            query.status = 'Inactive';
        const categories = yield blog_category_model_1.BlogCategory.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Blog categories retrieved successfully',
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogCategories = getBlogCategories;
const getBlogCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield blog_category_model_1.BlogCategory.findOne({ _id: id, isDeleted: false });
        if (!category)
            return next(new appError_1.appError('Blog category not found', 404));
        res.json({
            success: true,
            statusCode: 200,
            message: 'Blog category retrieved successfully',
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogCategoryById = getBlogCategoryById;
const updateBlogCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { categoryName, status } = req.body;
        const category = yield blog_category_model_1.BlogCategory.findOne({ _id: id, isDeleted: false });
        if (!category)
            return next(new appError_1.appError('Blog category not found', 404));
        if (categoryName && categoryName !== category.categoryName) {
            const exists = yield blog_category_model_1.BlogCategory.findOne({ categoryName: categoryName.trim(), isDeleted: false });
            if (exists)
                return next(new appError_1.appError('Category with this name already exists', 400));
        }
        const updateData = {};
        if (categoryName !== undefined)
            updateData.categoryName = categoryName;
        if (status !== undefined)
            updateData.status = status;
        const validated = blog_category_validation_1.blogCategoryUpdateValidation.parse(updateData);
        const updated = yield blog_category_model_1.BlogCategory.findByIdAndUpdate(id, validated, { new: true });
        res.json({
            success: true,
            statusCode: 200,
            message: 'Blog category updated successfully',
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateBlogCategory = updateBlogCategory;
const deleteBlogCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield blog_category_model_1.BlogCategory.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!category)
            return next(new appError_1.appError('Blog category not found', 404));
        res.json({
            success: true,
            statusCode: 200,
            message: 'Blog category deleted successfully',
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBlogCategory = deleteBlogCategory;
