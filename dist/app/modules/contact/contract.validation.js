"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractUpdateValidation = exports.contractValidation = void 0;
const zod_1 = require("zod");
exports.contractValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    brandName: zod_1.z.string().min(1, 'Brand name is required'),
    phoneNumber: zod_1.z.string().min(1, 'Phone number is required'),
    emailAddress: zod_1.z.string().email('Invalid email address'),
    message: zod_1.z.string().min(1, 'Message is required'),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional()
});
exports.contractUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    brandName: zod_1.z.string().min(1, 'Brand name is required').optional(),
    phoneNumber: zod_1.z.string().min(1, 'Phone number is required').optional(),
    emailAddress: zod_1.z.string().email('Invalid email address').optional(),
    message: zod_1.z.string().min(1, 'Message is required').optional(),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional()
});
