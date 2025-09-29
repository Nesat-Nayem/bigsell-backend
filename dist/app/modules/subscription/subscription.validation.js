"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionUpdateValidation = exports.subscriptionValidation = void 0;
const zod_1 = require("zod");
exports.subscriptionValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Plan name is required'),
    price: zod_1.z.number().min(0, 'Price must be non-negative'),
    currency: zod_1.z.string().optional(),
    billingCycle: zod_1.z.enum(['monthly', 'yearly']).optional(),
    color: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.string()).default([]).optional(),
    includeIds: zod_1.z.array(zod_1.z.string()).optional(),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaTags: zod_1.z.array(zod_1.z.string()).optional(),
    metaDescription: zod_1.z.string().optional(),
});
exports.subscriptionUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Plan name is required').optional(),
    price: zod_1.z.number().min(0, 'Price must be non-negative').optional(),
    currency: zod_1.z.string().optional(),
    billingCycle: zod_1.z.enum(['monthly', 'yearly']).optional(),
    color: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    includeIds: zod_1.z.array(zod_1.z.string()).optional(),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaTags: zod_1.z.array(zod_1.z.string()).optional(),
    metaDescription: zod_1.z.string().optional(),
});
