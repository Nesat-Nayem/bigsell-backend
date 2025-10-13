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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.getCouponById = exports.listCoupons = exports.createCoupon = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const coupon_model_1 = require("./coupon.model");
const product_model_1 = require("../product/product.model");
const appError_1 = require("../../errors/appError");
const normalizeCode = (c) => (c || '').trim().toUpperCase();
function isActiveWindow(c) {
    const now = new Date();
    return (c.status === 'active' &&
        new Date(c.startDate) <= now &&
        new Date(c.endDate) >= now &&
        c.isDeleted === false);
}
function computeEligibleSubtotal(items, targetVendor) {
    return __awaiter(this, void 0, void 0, function* () {
        const productIds = items.map((i) => i.productId).filter(Boolean);
        const products = yield product_model_1.Product.find({ _id: { $in: productIds }, isDeleted: false }).select('price vendor');
        const priceMap = new Map();
        products.forEach((p) => priceMap.set(String(p._id), { price: p.price || 0, vendor: p.vendor ? String(p.vendor) : null }));
        let eligible = 0;
        let all = 0;
        for (const it of items) {
            const meta = priceMap.get(String(it.productId));
            if (!meta)
                continue;
            const sub = (meta.price || 0) * Math.max(1, Number(it.quantity) || 1);
            all += sub;
            if (!targetVendor || (meta.vendor && String(meta.vendor) === String(targetVendor))) {
                eligible += sub;
            }
        }
        return { eligible, subtotal: all };
    });
}
function computeDiscountAmount(coupon, eligibleSubtotal) {
    let amount = 0;
    if (coupon.discountType === 'percentage') {
        amount = (eligibleSubtotal * Number(coupon.discountValue || 0)) / 100;
        if (coupon.maxDiscountAmount != null) {
            amount = Math.min(amount, Number(coupon.maxDiscountAmount));
        }
    }
    else {
        amount = Math.min(Number(coupon.discountValue || 0), eligibleSubtotal);
    }
    if (coupon.minOrderAmount != null && eligibleSubtotal < Number(coupon.minOrderAmount)) {
        return 0;
    }
    amount = Math.max(0, amount);
    return amount;
}
const createCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = req.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor._id))
            return next(new appError_1.appError('User not authenticated', 401));
        const isAdmin = String(actor.role) === 'admin';
        const isVendor = String(actor.role) === 'vendor';
        if (!isAdmin && !isVendor)
            return next(new appError_1.appError('Forbidden', 403));
        const body = req.body;
        const payload = {
            code: normalizeCode(body.code),
            discountType: body.discountType || 'percentage',
            discountValue: Number(body.discountValue),
            maxDiscountAmount: body.maxDiscountAmount != null ? Number(body.maxDiscountAmount) : undefined,
            minOrderAmount: body.minOrderAmount != null ? Number(body.minOrderAmount) : undefined,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            status: body.status === 'inactive' ? 'inactive' : 'active',
            vendor: isVendor ? actor._id : (body.vendor && isAdmin ? body.vendor : null),
            createdBy: actor._id,
        };
        const exists = yield coupon_model_1.Coupon.findOne({ code: payload.code, isDeleted: false });
        if (exists) {
            return next(new appError_1.appError('Coupon code already exists', 400));
        }
        const c = yield coupon_model_1.Coupon.create(payload);
        res.status(201).json({ success: true, statusCode: 201, message: 'Coupon created', data: c });
    }
    catch (e) {
        next(e);
    }
});
exports.createCoupon = createCoupon;
const listCoupons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = req.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor._id))
            return next(new appError_1.appError('User not authenticated', 401));
        const isAdmin = String(actor.role) === 'admin';
        const isVendor = String(actor.role) === 'vendor';
        if (!isAdmin && !isVendor)
            return next(new appError_1.appError('Forbidden', 403));
        const filter = { isDeleted: false };
        if (isVendor)
            filter.vendor = actor._id; // vendor sees only own coupons
        const items = yield coupon_model_1.Coupon.find(filter).sort('-createdAt');
        res.status(200).json({ success: true, statusCode: 200, message: 'Coupons retrieved', data: items });
    }
    catch (e) {
        next(e);
    }
});
exports.listCoupons = listCoupons;
const getCouponById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = req.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor._id))
            return next(new appError_1.appError('User not authenticated', 401));
        const isAdmin = String(actor.role) === 'admin';
        const isVendor = String(actor.role) === 'vendor';
        if (!isAdmin && !isVendor)
            return next(new appError_1.appError('Forbidden', 403));
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid coupon ID', 400));
        const c = yield coupon_model_1.Coupon.findOne({ _id: id, isDeleted: false });
        if (!c)
            return next(new appError_1.appError('Coupon not found', 404));
        if (isVendor && c.vendor && String(c.vendor) !== String(actor._id)) {
            return next(new appError_1.appError('Forbidden', 403));
        }
        res.status(200).json({ success: true, statusCode: 200, message: 'Coupon retrieved', data: c });
    }
    catch (e) {
        next(e);
    }
});
exports.getCouponById = getCouponById;
const updateCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = req.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor._id))
            return next(new appError_1.appError('User not authenticated', 401));
        const isAdmin = String(actor.role) === 'admin';
        const isVendor = String(actor.role) === 'vendor';
        if (!isAdmin && !isVendor)
            return next(new appError_1.appError('Forbidden', 403));
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid coupon ID', 400));
        const existing = yield coupon_model_1.Coupon.findOne({ _id: id, isDeleted: false });
        if (!existing)
            return next(new appError_1.appError('Coupon not found', 404));
        if (isVendor && existing.vendor && String(existing.vendor) !== String(actor._id)) {
            return next(new appError_1.appError('Forbidden', 403));
        }
        const body = req.body;
        if (body.code)
            existing.code = normalizeCode(body.code);
        if (body.discountType)
            existing.discountType = body.discountType;
        if (body.discountValue != null)
            existing.discountValue = Number(body.discountValue);
        if (body.maxDiscountAmount != null)
            existing.maxDiscountAmount = Number(body.maxDiscountAmount);
        if (body.minOrderAmount != null)
            existing.minOrderAmount = Number(body.minOrderAmount);
        if (body.startDate)
            existing.startDate = new Date(body.startDate);
        if (body.endDate)
            existing.endDate = new Date(body.endDate);
        if (body.status)
            existing.status = body.status === 'inactive' ? 'inactive' : 'active';
        yield existing.save();
        res.status(200).json({ success: true, statusCode: 200, message: 'Coupon updated', data: existing });
    }
    catch (e) {
        next(e);
    }
});
exports.updateCoupon = updateCoupon;
const deleteCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actor = req.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor._id))
            return next(new appError_1.appError('User not authenticated', 401));
        const isAdmin = String(actor.role) === 'admin';
        const isVendor = String(actor.role) === 'vendor';
        if (!isAdmin && !isVendor)
            return next(new appError_1.appError('Forbidden', 403));
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid coupon ID', 400));
        const existing = yield coupon_model_1.Coupon.findOne({ _id: id, isDeleted: false });
        if (!existing)
            return next(new appError_1.appError('Coupon not found', 404));
        if (isVendor && existing.vendor && String(existing.vendor) !== String(actor._id)) {
            return next(new appError_1.appError('Forbidden', 403));
        }
        existing.isDeleted = true;
        yield existing.save();
        res.status(200).json({ success: true, statusCode: 200, message: 'Coupon deleted', data: existing });
    }
    catch (e) {
        next(e);
    }
});
exports.deleteCoupon = deleteCoupon;
const applyCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, items } = req.body;
        const normalized = normalizeCode(code);
        if (!normalized)
            return next(new appError_1.appError('Coupon code required', 400));
        if (!Array.isArray(items) || items.length === 0)
            return next(new appError_1.appError('Items required', 400));
        const c = yield coupon_model_1.Coupon.findOne({ code: normalized, isDeleted: false });
        if (!c || !isActiveWindow(c)) {
            return res.status(200).json({ success: true, statusCode: 200, message: 'Invalid or expired coupon', data: { valid: false, discountAmount: 0 } });
        }
        const { eligible, subtotal } = yield computeEligibleSubtotal(items, c.vendor ? String(c.vendor) : null);
        const discountAmount = computeDiscountAmount(c, eligible);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: discountAmount > 0 ? 'Coupon applied' : 'Coupon not applicable',
            data: {
                valid: discountAmount > 0,
                discountAmount,
                code: c.code,
                discountType: c.discountType,
                eligibleSubtotal: eligible,
                subtotal,
            },
        });
    }
    catch (e) {
        next(e);
    }
});
exports.applyCoupon = applyCoupon;
