"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqUpdateValidation = exports.faqValidation = void 0;
const zod_1 = require("zod");
exports.faqValidation = zod_1.z.object({
    question: zod_1.z.string().min(1, 'Question is required'),
    answer: zod_1.z.string().min(1, 'Answer is required'),
    category: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.faqUpdateValidation = zod_1.z.object({
    question: zod_1.z.string().min(1, 'Question is required').optional(),
    answer: zod_1.z.string().min(1, 'Answer is required').optional(),
    category: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional()
});
