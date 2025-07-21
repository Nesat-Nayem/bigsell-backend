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
exports.deleteOfferById = exports.updateOfferById = exports.getOfferById = exports.getAllOffers = exports.createOffer = void 0;
const offer_model_1 = require("./offer.model");
const offer_validation_1 = require("./offer.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { isActive, order } = req.body;
        // If image is uploaded through multer middleware, req.file will be available
        if (!req.file) {
            next(new appError_1.appError("Offer image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const image = req.file.path;
        // Validate the input
        const validatedData = offer_validation_1.offerValidation.parse({
            image,
            isActive: isActive === 'true' || isActive === true,
            order: order ? parseInt(order) : undefined
        });
        // Create a new offer
        const offer = new offer_model_1.Offer(validatedData);
        yield offer.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Offer created successfully",
            data: offer,
        });
        return;
    }
    catch (error) {
        // If error is during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createOffer = createOffer;
const getAllOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active offers if requested
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        const offers = yield offer_model_1.Offer.find(filter).sort({ order: 1, createdAt: -1 });
        if (offers.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No offers found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Offers retrieved successfully",
            data: offers,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllOffers = getAllOffers;
const getOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield offer_model_1.Offer.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!offer) {
            return next(new appError_1.appError("Offer not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Offer retrieved successfully",
            data: offer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getOfferById = getOfferById;
const updateOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const offerId = req.params.id;
        const { isActive, order } = req.body;
        // Find the offer to update
        const offer = yield offer_model_1.Offer.findOne({
            _id: offerId,
            isDeleted: false
        });
        if (!offer) {
            next(new appError_1.appError("Offer not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
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
            if (offer.image) {
                const publicId = (_a = offer.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = offer_validation_1.offerUpdateValidation.parse(updateData);
            // Update the offer
            const updatedOffer = yield offer_model_1.Offer.findByIdAndUpdate(offerId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "Offer updated successfully",
                data: updatedOffer,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: offer,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateOfferById = updateOfferById;
const deleteOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield offer_model_1.Offer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!offer) {
            next(new appError_1.appError("Offer not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Offer deleted successfully",
            data: offer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteOfferById = deleteOfferById;
