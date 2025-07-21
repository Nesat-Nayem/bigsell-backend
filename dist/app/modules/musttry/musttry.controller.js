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
exports.deleteMustTryById = exports.updateMustTryById = exports.getMustTryById = exports.getAllMustTry = exports.createMustTry = void 0;
const musttry_model_1 = require("./musttry.model");
const musttry_validation_1 = require("./musttry.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createMustTry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, isActive, order } = req.body;
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("MustTry image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Validate the input
        const validatedData = musttry_validation_1.mustTryValidation.parse({
            title,
            image,
            isActive: isActive === 'true' || isActive === true,
            order: order ? parseInt(order) : undefined
        });
        // Create a new mustTry
        const mustTry = new musttry_model_1.MustTry(validatedData);
        yield mustTry.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "MustTry item created successfully",
            data: mustTry,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createMustTry = createMustTry;
const getAllMustTry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active items if requested
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        const mustTryItems = yield musttry_model_1.MustTry.find(filter).sort({ order: 1, createdAt: -1 });
        if (mustTryItems.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No MustTry items found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "MustTry items retrieved successfully",
            data: mustTryItems,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMustTry = getAllMustTry;
const getMustTryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mustTry = yield musttry_model_1.MustTry.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!mustTry) {
            return next(new appError_1.appError("MustTry item not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "MustTry item retrieved successfully",
            data: mustTry,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getMustTryById = getMustTryById;
const updateMustTryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const mustTryId = req.params.id;
        const { title, isActive, order } = req.body;
        // Find the mustTry to update
        const mustTry = yield musttry_model_1.MustTry.findOne({
            _id: mustTryId,
            isDeleted: false
        });
        if (!mustTry) {
            next(new appError_1.appError("MustTry item not found", 404));
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
            if (mustTry.image) {
                const publicId = (_a = mustTry.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = musttry_validation_1.mustTryUpdateValidation.parse(updateData);
            // Update the mustTry
            const updatedMustTry = yield musttry_model_1.MustTry.findByIdAndUpdate(mustTryId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "MustTry item updated successfully",
                data: updatedMustTry,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: mustTry,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateMustTryById = updateMustTryById;
const deleteMustTryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mustTry = yield musttry_model_1.MustTry.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!mustTry) {
            next(new appError_1.appError("MustTry item not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "MustTry item deleted successfully",
            data: mustTry,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMustTryById = deleteMustTryById;
