"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustTryUpdateValidation = exports.mustTryValidation = void 0;
const zod_1 = require("zod");
exports.mustTryValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'MustTry title is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
exports.mustTryUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'MustTry title is required').optional(),
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
