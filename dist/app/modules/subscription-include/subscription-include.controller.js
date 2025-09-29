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
exports.toggleIncludeStatus = exports.deleteInclude = exports.updateInclude = exports.getIncludeById = exports.getIncludes = exports.createInclude = void 0;
const subscription_include_model_1 = require("./subscription-include.model");
const subscription_include_validation_1 = require("./subscription-include.validation");
const appError_1 = require("../../errors/appError");
const createInclude = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const raw = req.body || {};
        const parsed = subscription_include_validation_1.includeValidation.parse({
            title: raw.title,
            order: typeof raw.order === 'string' ? parseInt(raw.order) : raw.order,
            isActive: raw.isActive === 'true' || raw.isActive === true,
        });
        const doc = yield subscription_include_model_1.SubscriptionInclude.create(parsed);
        res.status(201).json({ success: true, statusCode: 201, message: 'Include created successfully', data: doc });
    }
    catch (err) {
        next(err);
    }
});
exports.createInclude = createInclude;
const getIncludes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page, limit, active } = req.query;
        const filter = { isDeleted: false };
        if (active !== undefined)
            filter.isActive = active === 'true';
        if (search) {
            filter.$or = [
                { title: { $regex: String(search), $options: 'i' } },
            ];
        }
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = yield Promise.all([
            subscription_include_model_1.SubscriptionInclude.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
            subscription_include_model_1.SubscriptionInclude.countDocuments(filter),
        ]);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Includes retrieved successfully',
            data: items,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getIncludes = getIncludes;
const getIncludeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield subscription_include_model_1.SubscriptionInclude.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Include not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Include retrieved', data: doc });
    }
    catch (err) {
        next(err);
    }
});
exports.getIncludeById = getIncludeById;
const updateInclude = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const raw = req.body || {};
        const payload = {
            title: raw.title,
            order: raw.order !== undefined ? (typeof raw.order === 'string' ? parseInt(raw.order) : raw.order) : undefined,
            isActive: raw.isActive !== undefined ? (raw.isActive === 'true' || raw.isActive === true) : undefined,
        };
        const parsed = subscription_include_validation_1.includeUpdateValidation.parse(payload);
        const doc = yield subscription_include_model_1.SubscriptionInclude.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, parsed, { new: true });
        if (!doc)
            return next(new appError_1.appError('Include not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Include updated', data: doc });
    }
    catch (err) {
        next(err);
    }
});
exports.updateInclude = updateInclude;
const deleteInclude = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield subscription_include_model_1.SubscriptionInclude.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!doc)
            return next(new appError_1.appError('Include not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Include deleted', data: doc });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteInclude = deleteInclude;
const toggleIncludeStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isActive } = req.body;
        const doc = yield subscription_include_model_1.SubscriptionInclude.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Include not found', 404));
        if (typeof isActive === 'boolean')
            doc.isActive = isActive;
        else
            doc.isActive = !doc.isActive;
        yield doc.save();
        res.json({ success: true, statusCode: 200, message: 'Include status updated', data: doc });
    }
    catch (err) {
        next(err);
    }
});
exports.toggleIncludeStatus = toggleIncludeStatus;
