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
exports.deleteHeaderBannerById = exports.updateHeaderBannerById = exports.getHeaderBannerById = exports.getAllHeaderBanners = exports.createHeaderBanner = void 0;
const header_banner_model_1 = require("./header-banner.model");
const header_banner_validation_1 = require("./header-banner.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const createHeaderBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, isActive, order } = req.body;
        if (!req.file) {
            next(new appError_1.appError('Header banner image is required', 400));
            return;
        }
        const image = req.file.path;
        const validated = header_banner_validation_1.headerBannerValidation.parse({
            title,
            image,
            isActive: isActive === 'true' || isActive === true,
            order: order ? parseInt(order) : undefined,
        });
        const doc = new header_banner_model_1.HeaderBanner(validated);
        yield doc.save();
        res.status(201).json({ success: true, statusCode: 201, message: 'Header banner created successfully', data: doc });
    }
    catch (error) {
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
        }
        next(error);
    }
});
exports.createHeaderBanner = createHeaderBanner;
const getAllHeaderBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true')
            filter.isActive = true;
        const docs = yield header_banner_model_1.HeaderBanner.find(filter).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Header banners retrieved successfully', data: docs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllHeaderBanners = getAllHeaderBanners;
const getHeaderBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield header_banner_model_1.HeaderBanner.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Header banner not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Header banner retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getHeaderBannerById = getHeaderBannerById;
const updateHeaderBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, isActive, order } = req.body;
        const doc = yield header_banner_model_1.HeaderBanner.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Header banner not found', 404));
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (isActive !== undefined)
            updateData.isActive = isActive === 'true' || isActive === true;
        if (order !== undefined)
            updateData.order = parseInt(order);
        if (req.file) {
            updateData.image = req.file.path;
            if (doc.image) {
                const publicId = (_a = doc.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId)
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
        }
        const validated = header_banner_validation_1.headerBannerUpdateValidation.parse(updateData);
        const updated = yield header_banner_model_1.HeaderBanner.findByIdAndUpdate(id, validated, { new: true });
        res.json({ success: true, statusCode: 200, message: 'Header banner updated successfully', data: updated });
    }
    catch (error) {
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId)
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
        }
        next(error);
    }
});
exports.updateHeaderBannerById = updateHeaderBannerById;
const deleteHeaderBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield header_banner_model_1.HeaderBanner.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!updated)
            return next(new appError_1.appError('Header banner not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Header banner deleted successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteHeaderBannerById = deleteHeaderBannerById;
