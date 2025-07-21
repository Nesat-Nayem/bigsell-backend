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
exports.deleteBannerById = exports.updateBannerById = exports.getBannerById = exports.getAllBanners = exports.createBanner = void 0;
const banner_model_1 = require("./banner.model");
const banner_validation_1 = require("./banner.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, isActive, order } = req.body;
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("Banner image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Validate the input
        const validatedData = banner_validation_1.bannerValidation.parse({
            title,
            image,
            isActive: isActive === 'true' || isActive === true,
            order: order ? parseInt(order) : undefined
        });
        // Create a new banner
        const banner = new banner_model_1.Banner(validatedData);
        yield banner.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Banner created successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createBanner = createBanner;
const getAllBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active banners if requested
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        const banners = yield banner_model_1.Banner.find(filter).sort({ order: 1, createdAt: -1 });
        if (banners.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No banners found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banners retrieved successfully",
            data: banners,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllBanners = getAllBanners;
const getBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banner = yield banner_model_1.Banner.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!banner) {
            return next(new appError_1.appError("Banner not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banner retrieved successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getBannerById = getBannerById;
const updateBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const bannerId = req.params.id;
        const { title, isActive, order } = req.body;
        // Find the banner to update
        const banner = yield banner_model_1.Banner.findOne({
            _id: bannerId,
            isDeleted: false
        });
        if (!banner) {
            next(new appError_1.appError("Banner not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }
        if (order !== undefined) {
            updateData.order = parseInt(order);
        }
        // If there's a new image
        if (req.file) {
            updateData.image = req.file.path;
            // Delete the old image from cloudinary if it exists
            if (banner.image) {
                const publicId = (_a = banner.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = banner_validation_1.bannerUpdateValidation.parse(updateData);
            // Update the banner
            const updatedBanner = yield banner_model_1.Banner.findByIdAndUpdate(bannerId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "Banner updated successfully",
                data: updatedBanner,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: banner,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-banners/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateBannerById = updateBannerById;
const deleteBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banner = yield banner_model_1.Banner.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!banner) {
            next(new appError_1.appError("Banner not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Banner deleted successfully",
            data: banner,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBannerById = deleteBannerById;
