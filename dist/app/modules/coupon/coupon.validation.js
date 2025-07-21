"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCouponValidation = exports.createCouponValidation = void 0;
const zod_1 = require("zod");
exports.createCouponValidation = zod_1.z.object({
    couponCode: zod_1.z.string().min(3, 'Coupon code must be at least 3 characters long'),
    discountPercentage: zod_1.z.number().min(0).max(100),
    maxDiscountAmount: zod_1.z.number().min(0),
    minOrderAmount: zod_1.z.number().min(0).optional().default(0),
    validFrom: zod_1.z.string().transform((str) => new Date(str)),
    validUntil: zod_1.z.string().transform((str) => new Date(str)),
    usageLimit: zod_1.z.number().int().min(1),
    usagePerUser: zod_1.z.number().int().min(1).optional().default(1),
    restaurantId: zod_1.z.string().min(1, "Restaurant ID is required"),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateCouponValidation = exports.createCouponValidation.partial();
