"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractUpdateValidation = exports.contractValidation = void 0;
const zod_1 = require("zod");
exports.contractValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional()
});
exports.contractUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z.string().min(1, 'Phone is required').optional(),
    subject: zod_1.z.string().min(1, 'Subject is required').optional(),
    message: zod_1.z.string().min(1, 'Message is required').optional(),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional()
});
