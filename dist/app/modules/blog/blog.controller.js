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
exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getBlogs = void 0;
const blog_model_1 = require("./blog.model");
const blog_validation_1 = require("./blog.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
// import cloudinary from "../../config/cloudinary";
// Get all blogs
const getBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        // Build query
        const query = { isDeleted: false };
        // Add status filter if provided
        if (status === 'active') {
            query.status = 'Active';
        }
        else if (status === 'inactive') {
            query.status = 'Inactive';
        }
        // Get blogs
        const blogs = yield blog_model_1.Blog.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: "Blogs retrieved successfully",
            data: blogs,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogs = getBlogs;
// Get blog by ID
const getBlogById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find blog
        const blog = yield blog_model_1.Blog.findOne({ _id: id, isDeleted: false });
        if (!blog) {
            next(new appError_1.appError("Blog not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Blog retrieved successfully",
            data: blog,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogById = getBlogById;
// Create blog
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, shortDesc, longDesc, status } = req.body;
        // Check if blog with same title already exists
        const existingBlog = yield blog_model_1.Blog.findOne({ title, isDeleted: false });
        if (existingBlog) {
            next(new appError_1.appError("Blog with this title already exists", 400));
            return;
        }
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("Image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Validate the input
        const validatedData = blog_validation_1.blogValidation.parse({
            title,
            shortDesc,
            longDesc,
            image,
            status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive'
        });
        // Create a new blog
        const blog = new blog_model_1.Blog(validatedData);
        yield blog.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Blog created successfully",
            data: blog,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-blogs/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createBlog = createBlog;
// Update blog
const updateBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, shortDesc, longDesc, status } = req.body;
        // Find blog
        const blog = yield blog_model_1.Blog.findOne({ _id: id, isDeleted: false });
        if (!blog) {
            next(new appError_1.appError("Blog not found", 404));
            return;
        }
        // Check if title is being updated and if it already exists
        if (title && title !== blog.title) {
            const existingBlog = yield blog_model_1.Blog.findOne({ title, isDeleted: false });
            if (existingBlog) {
                next(new appError_1.appError("Blog with this title already exists", 400));
                return;
            }
        }
        // Prepare update data
        const updateData = {
            title: title || blog.title,
            shortDesc: shortDesc || blog.shortDesc,
            longDesc: longDesc || blog.longDesc,
            status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive'
        };
        // If image is uploaded
        if (req.file) {
            // Delete old image from cloudinary
            const oldImagePublicId = (_a = blog.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
            if (oldImagePublicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-blogs/${oldImagePublicId}`);
            }
            // Add new image URL
            updateData.image = req.file.path;
        }
        // Validate the input
        const validatedData = blog_validation_1.updateBlogValidation.parse(updateData);
        // Update blog
        const updatedBlog = yield blog_model_1.Blog.findByIdAndUpdate(id, validatedData, { new: true });
        res.json({
            success: true,
            statusCode: 200,
            message: "Blog updated successfully",
            data: updatedBlog,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-blogs/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateBlog = updateBlog;
// Delete blog
const deleteBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find blog
        const blog = yield blog_model_1.Blog.findOne({ _id: id, isDeleted: false });
        if (!blog) {
            next(new appError_1.appError("Blog not found", 404));
            return;
        }
        // Soft delete the blog
        blog.isDeleted = true;
        yield blog.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Blog deleted successfully",
            data: blog,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBlog = deleteBlog;
