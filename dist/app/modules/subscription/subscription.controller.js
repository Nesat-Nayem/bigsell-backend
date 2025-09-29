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
exports.toggleSubscriptionStatus = exports.deleteSubscriptionById = exports.updateSubscriptionById = exports.getSubscriptionById = exports.getAllSubscriptions = exports.createSubscription = void 0;
const subscription_model_1 = require("./subscription.model");
const subscription_include_model_1 = require("../subscription-include/subscription-include.model");
const subscription_validation_1 = require("./subscription.validation");
const appError_1 = require("../../errors/appError");
const createSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const raw = req.body || {};
        // Normalize types
        const parsed = subscription_validation_1.subscriptionValidation.parse({
            name: raw.name,
            price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
            currency: raw.currency,
            billingCycle: raw.billingCycle,
            color: raw.color,
            features: Array.isArray(raw.features)
                ? raw.features
                : typeof raw.features === 'string'
                    ? raw.features.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
            includeIds: Array.isArray(raw.includeIds)
                ? raw.includeIds.map((id) => String(id))
                : typeof raw.includeIds === 'string'
                    ? String(raw.includeIds).split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
            order: typeof raw.order === 'string' ? parseInt(raw.order) : raw.order,
            isActive: raw.isActive === 'true' || raw.isActive === true,
            metaTitle: raw.metaTitle,
            metaTags: Array.isArray(raw.metaTags)
                ? raw.metaTags
                : typeof raw.metaTags === 'string'
                    ? raw.metaTags.split(',').map((s) => s.trim()).filter(Boolean)
                    : undefined,
            metaDescription: raw.metaDescription,
        });
        // Derive features from includeIds (active, non-deleted)
        let derivedFeatures = [];
        if (parsed.includeIds && parsed.includeIds.length > 0) {
            const includes = yield subscription_include_model_1.SubscriptionInclude.find({
                _id: { $in: parsed.includeIds },
                isDeleted: false,
                isActive: true,
            });
            derivedFeatures = includes.map((i) => i.title);
        }
        const doc = new subscription_model_1.Subscription(Object.assign(Object.assign({}, parsed), { features: Array.from(new Set([...(parsed.features || []), ...derivedFeatures])) }));
        yield doc.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Subscription created successfully',
            data: doc,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createSubscription = createSubscription;
const getAllSubscriptions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { active, limit, page, search } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true')
            filter.isActive = true;
        if (active === 'false')
            filter.isActive = false;
        if (search) {
            const s = String(search);
            filter.$or = [
                { name: { $regex: s, $options: 'i' } },
                { slug: { $regex: s, $options: 'i' } },
                { metaTitle: { $regex: s, $options: 'i' } },
            ];
        }
        const sort = { order: 1, createdAt: -1 };
        const limitNum = limit ? parseInt(limit) : undefined;
        const pageNum = page ? parseInt(page) : undefined;
        // If pagination requested
        if (pageNum && limitNum) {
            const skip = (Math.max(1, pageNum) - 1) * Math.max(1, limitNum);
            const [items, total] = yield Promise.all([
                subscription_model_1.Subscription.find(filter).sort(sort).skip(skip).limit(limitNum),
                subscription_model_1.Subscription.countDocuments(filter),
            ]);
            return res.json({
                success: true,
                statusCode: 200,
                message: 'Subscriptions retrieved successfully',
                data: items,
                meta: {
                    total,
                    page: Math.max(1, pageNum),
                    limit: Math.max(1, limitNum),
                    totalPages: Math.ceil(total / Math.max(1, limitNum)) || 1,
                },
            });
        }
        // Non-paginated with optional limit (keeps vendor endpoint behavior)
        const q = subscription_model_1.Subscription.find(filter).sort(sort);
        if (limitNum && limitNum > 0)
            q.limit(limitNum);
        const items = yield q.exec();
        return res.json({
            success: true,
            statusCode: 200,
            message: 'Subscriptions retrieved successfully',
            data: items,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSubscriptions = getAllSubscriptions;
const getSubscriptionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sub = yield subscription_model_1.Subscription.findOne({ _id: req.params.id, isDeleted: false });
        if (!sub)
            return next(new appError_1.appError('Subscription not found', 404));
        res.json({
            success: true,
            statusCode: 200,
            message: 'Subscription retrieved successfully',
            data: sub,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSubscriptionById = getSubscriptionById;
const updateSubscriptionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sub = yield subscription_model_1.Subscription.findOne({ _id: req.params.id, isDeleted: false });
        if (!sub)
            return next(new appError_1.appError('Subscription not found', 404));
        const raw = req.body || {};
        const payload = {
            name: raw.name,
            price: raw.price !== undefined ? (typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price) : undefined,
            currency: raw.currency,
            billingCycle: raw.billingCycle,
            color: raw.color,
            features: Array.isArray(raw.features)
                ? raw.features
                : typeof raw.features === 'string'
                    ? raw.features.split(',').map((s) => s.trim()).filter(Boolean)
                    : undefined,
            includeIds: Array.isArray(raw.includeIds)
                ? raw.includeIds.map((id) => String(id))
                : typeof raw.includeIds === 'string'
                    ? String(raw.includeIds).split(',').map((s) => s.trim()).filter(Boolean)
                    : undefined,
            order: raw.order !== undefined ? (typeof raw.order === 'string' ? parseInt(raw.order) : raw.order) : undefined,
            isActive: raw.isActive !== undefined ? (raw.isActive === 'true' || raw.isActive === true) : undefined,
            metaTitle: raw.metaTitle,
            metaTags: Array.isArray(raw.metaTags)
                ? raw.metaTags
                : typeof raw.metaTags === 'string'
                    ? raw.metaTags.split(',').map((s) => s.trim()).filter(Boolean)
                    : undefined,
            metaDescription: raw.metaDescription,
        };
        const validated = subscription_validation_1.subscriptionUpdateValidation.parse(payload);
        // Merge derived features from includeIds if provided
        let derivedFeatures;
        if (validated.includeIds && Array.isArray(validated.includeIds)) {
            const includes = yield subscription_include_model_1.SubscriptionInclude.find({
                _id: { $in: validated.includeIds },
                isDeleted: false,
                isActive: true,
            });
            derivedFeatures = includes.map((i) => i.title);
        }
        // Apply updates and save (to trigger pre-save hook for max-3-active rule)
        Object.assign(sub, validated);
        if (derivedFeatures) {
            const curr = Array.isArray(sub.features) ? sub.features : [];
            sub.features = Array.from(new Set([...((_a = validated.features) !== null && _a !== void 0 ? _a : curr), ...derivedFeatures]));
        }
        yield sub.save();
        res.json({
            success: true,
            statusCode: 200,
            message: 'Subscription updated successfully',
            data: sub,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSubscriptionById = updateSubscriptionById;
const deleteSubscriptionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sub = yield subscription_model_1.Subscription.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!sub)
            return next(new appError_1.appError('Subscription not found', 404));
        res.json({
            success: true,
            statusCode: 200,
            message: 'Subscription deleted successfully',
            data: sub,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSubscriptionById = deleteSubscriptionById;
const toggleSubscriptionStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sub = yield subscription_model_1.Subscription.findOne({ _id: req.params.id, isDeleted: false });
        if (!sub)
            return next(new appError_1.appError('Subscription not found', 404));
        const body = (req.body || {});
        if (typeof body.isActive === 'boolean')
            sub.isActive = body.isActive;
        else
            sub.isActive = !sub.isActive;
        yield sub.save();
        res.json({
            success: true,
            statusCode: 200,
            message: 'Subscription status updated',
            data: sub,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.toggleSubscriptionStatus = toggleSubscriptionStatus;
