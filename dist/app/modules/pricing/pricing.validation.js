"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingUpdateValidation = exports.pricingValidation = void 0;
const zod_1 = require("zod");
exports.pricingValidation = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters long"),
    price: zod_1.z.string().min(1, "Price is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters long"),
    features: zod_1.z.array(zod_1.z.string()).min(1, "At least one feature is required"),
    color: zod_1.z.string().min(3, "Color must be at least 3 characters long"),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.pricingUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters long").optional(),
    price: zod_1.z.string().min(1, "Price is required").optional(),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters long").optional(),
    features: zod_1.z.array(zod_1.z.string()).min(1, "At least one feature is required").optional(),
    color: zod_1.z.string().min(3, "Color must be at least 3 characters long").optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
