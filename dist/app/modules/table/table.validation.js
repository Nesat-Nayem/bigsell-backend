"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableUpdateValidation = exports.tableValidation = void 0;
const zod_1 = require("zod");
exports.tableValidation = zod_1.z.object({
    tableNumber: zod_1.z.number().int().positive('Table number must be a positive integer'),
    isActive: zod_1.z.boolean().optional(),
    description: zod_1.z.string().optional()
});
exports.tableUpdateValidation = zod_1.z.object({
    tableNumber: zod_1.z.number().int().positive('Table number must be a positive integer').optional(),
    isActive: zod_1.z.boolean().optional(),
    description: zod_1.z.string().optional()
});
