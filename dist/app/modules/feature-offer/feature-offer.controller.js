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
exports.deleteFeatureOfferById = exports.updateFeatureOfferById = exports.getFeatureOfferById = exports.getAllFeatureOffers = exports.createFeatureOffer = void 0;
const feature_offer_model_1 = require("./feature-offer.model");
const feature_offer_validation_1 = require("./feature-offer.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createFeatureOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, subtitle, description, url, isActive, order } = req.body;
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("Feature offer image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Validate the input
        const validatedData = feature_offer_validation_1.featureOfferValidation.parse({
            title,
            subtitle,
            description,
            image,
            url,
            isActive: isActive === 'true' || isActive === true,
            order: order ? parseInt(order) : undefined
        });
        // Create a new feature offer
        const featureOffer = new feature_offer_model_1.FeatureOffer(validatedData);
        yield featureOffer.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Feature offer created successfully",
            data: featureOffer,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createFeatureOffer = createFeatureOffer;
const getAllFeatureOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active feature offers if requested
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        const featureOffers = yield feature_offer_model_1.FeatureOffer.find(filter).sort({ order: 1, createdAt: -1 });
        if (featureOffers.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No feature offers found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Feature offers retrieved successfully",
            data: featureOffers,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllFeatureOffers = getAllFeatureOffers;
const getFeatureOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featureOffer = yield feature_offer_model_1.FeatureOffer.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!featureOffer) {
            return next(new appError_1.appError("Feature offer not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Feature offer retrieved successfully",
            data: featureOffer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getFeatureOfferById = getFeatureOfferById;
const updateFeatureOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const featureOfferId = req.params.id;
        const { title, subtitle, description, url, isActive, order } = req.body;
        // Find the feature offer to update
        const featureOffer = yield feature_offer_model_1.FeatureOffer.findOne({
            _id: featureOfferId,
            isDeleted: false
        });
        if (!featureOffer) {
            next(new appError_1.appError("Feature offer not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (subtitle !== undefined) {
            updateData.subtitle = subtitle;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (url !== undefined) {
            updateData.url = url;
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
            if (featureOffer.image) {
                const publicId = (_a = featureOffer.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = feature_offer_validation_1.featureOfferUpdateValidation.parse(updateData);
            // Update the feature offer
            const updatedFeatureOffer = yield feature_offer_model_1.FeatureOffer.findByIdAndUpdate(featureOfferId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "Feature offer updated successfully",
                data: updatedFeatureOffer,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: featureOffer,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateFeatureOfferById = updateFeatureOfferById;
const deleteFeatureOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featureOffer = yield feature_offer_model_1.FeatureOffer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!featureOffer) {
            next(new appError_1.appError("Feature offer not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Feature offer deleted successfully",
            data: featureOffer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFeatureOfferById = deleteFeatureOfferById;
