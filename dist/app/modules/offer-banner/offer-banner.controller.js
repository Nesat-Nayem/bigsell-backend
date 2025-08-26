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
exports.deleteOfferBannerById = exports.updateOfferBannerById = exports.getOfferBannerById = exports.getAllOfferBanners = exports.createOfferBanner = void 0;
const offer_banner_model_1 = require("./offer-banner.model");
const offer_banner_validation_1 = require("./offer-banner.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createOfferBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, subtitle, offer, url } = req.body;
        if (!req.file) {
            next(new appError_1.appError('Offer banner image is required', 400));
            return;
        }
        const image = req.file.path;
        const validated = offer_banner_validation_1.offerBannerValidation.parse({ title, subtitle, offer, url, image });
        const doc = new offer_banner_model_1.OfferBanner(validated);
        yield doc.save();
        res.status(201).json({ success: true, statusCode: 201, message: 'Offer banner created successfully', data: doc });
    }
    catch (error) {
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
        }
        next(error);
    }
});
exports.createOfferBanner = createOfferBanner;
const getAllOfferBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docs = yield offer_banner_model_1.OfferBanner.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Offer banners retrieved successfully', data: docs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllOfferBanners = getAllOfferBanners;
const getOfferBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield offer_banner_model_1.OfferBanner.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Offer banner not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Offer banner retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getOfferBannerById = getOfferBannerById;
const updateOfferBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, subtitle, offer, url } = req.body;
        const doc = yield offer_banner_model_1.OfferBanner.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Offer banner not found', 404));
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (subtitle !== undefined)
            updateData.subtitle = subtitle;
        if (offer !== undefined)
            updateData.offer = offer;
        if (url !== undefined)
            updateData.url = url;
        if (req.file) {
            updateData.image = req.file.path;
            if (doc.image) {
                const publicId = (_a = doc.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
        }
        const validated = offer_banner_validation_1.updateOfferBannerValidation.parse(updateData);
        const updated = yield offer_banner_model_1.OfferBanner.findByIdAndUpdate(id, validated, { new: true });
        res.json({ success: true, statusCode: 200, message: 'Offer banner updated successfully', data: updated });
    }
    catch (error) {
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
        }
        next(error);
    }
});
exports.updateOfferBannerById = updateOfferBannerById;
const deleteOfferBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield offer_banner_model_1.OfferBanner.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!updated)
            return next(new appError_1.appError('Offer banner not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Offer banner deleted successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteOfferBannerById = deleteOfferBannerById;
