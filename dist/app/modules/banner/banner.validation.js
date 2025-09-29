"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerUpdateValidation = exports.bannerValidation = void 0;
const zod_1 = require("zod");
exports.bannerValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Banner title is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
exports.bannerUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Banner title is required').optional(),
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
