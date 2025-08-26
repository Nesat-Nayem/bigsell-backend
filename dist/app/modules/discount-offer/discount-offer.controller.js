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
exports.deleteDiscountOfferById = exports.updateDiscountOfferById = exports.getDiscountOfferById = exports.getAllDiscountOffers = exports.createDiscountOffer = void 0;
const discount_offer_model_1 = require("./discount-offer.model");
const discount_offer_validation_1 = require("./discount-offer.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createDiscountOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, offer } = req.body;
        if (!req.file) {
            next(new appError_1.appError('Offer image is required', 400));
            return;
        }
        const image = req.file.path;
        const validated = discount_offer_validation_1.discountOfferValidation.parse({ title, offer, image });
        const doc = new discount_offer_model_1.DiscountOffer(validated);
        yield doc.save();
        res.status(201).json({ success: true, statusCode: 201, message: 'Discount offer created successfully', data: doc });
    }
    catch (error) {
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
        }
        next(error);
    }
});
exports.createDiscountOffer = createDiscountOffer;
const getAllDiscountOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docs = yield discount_offer_model_1.DiscountOffer.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Discount offers retrieved successfully', data: docs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllDiscountOffers = getAllDiscountOffers;
const getDiscountOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield discount_offer_model_1.DiscountOffer.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Discount offer not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Discount offer retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getDiscountOfferById = getDiscountOfferById;
const updateDiscountOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, offer } = req.body;
        const doc = yield discount_offer_model_1.DiscountOffer.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Discount offer not found', 404));
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (offer !== undefined)
            updateData.offer = offer;
        if (req.file) {
            updateData.image = req.file.path;
            if (doc.image) {
                const publicId = (_a = doc.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
        }
        const validated = discount_offer_validation_1.updateDiscountOfferValidation.parse(updateData);
        const updated = yield discount_offer_model_1.DiscountOffer.findByIdAndUpdate(id, validated, { new: true });
        res.json({ success: true, statusCode: 200, message: 'Discount offer updated successfully', data: updated });
    }
    catch (error) {
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
        }
        next(error);
    }
});
exports.updateDiscountOfferById = updateDiscountOfferById;
const deleteDiscountOfferById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield discount_offer_model_1.DiscountOffer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!updated)
            return next(new appError_1.appError('Discount offer not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Discount offer deleted successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDiscountOfferById = deleteDiscountOfferById;
