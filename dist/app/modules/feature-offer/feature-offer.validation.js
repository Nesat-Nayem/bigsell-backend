"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureOfferUpdateValidation = exports.featureOfferValidation = void 0;
const zod_1 = require("zod");
exports.featureOfferValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Feature offer title is required'),
    subtitle: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().min(1, 'Image is required'),
    url: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
exports.featureOfferUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Feature offer title is required').optional(),
    subtitle: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    url: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
