"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerBannerUpdateValidation = exports.headerBannerValidation = void 0;
const zod_1 = require("zod");
exports.headerBannerValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional(),
});
exports.headerBannerUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    image: zod_1.z.string().min(1).optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional(),
});
