"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerUpdateValidation = exports.offerValidation = void 0;
const zod_1 = require("zod");
exports.offerValidation = zod_1.z.object({
    image: zod_1.z.string().min(1, 'Image is required'),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
exports.offerUpdateValidation = zod_1.z.object({
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
