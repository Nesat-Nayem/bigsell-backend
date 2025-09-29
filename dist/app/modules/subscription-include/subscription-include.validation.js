"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeUpdateValidation = exports.includeValidation = void 0;
const zod_1 = require("zod");
exports.includeValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.includeUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional(),
});
