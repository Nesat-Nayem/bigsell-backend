"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryUpdateValidation = exports.categoryValidation = void 0;
const zod_1 = require("zod");
exports.categoryValidation = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters long"),
    image: zod_1.z.string().url("Image must be a valid URL"),
    productCategory: zod_1.z.string().min(1, 'Product Category is required'),
    productSubcategory: zod_1.z.string().optional(),
    productSubSubcategory: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.categoryUpdateValidation = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(2, "Title must be at least 2 characters long")
        .optional(),
    image: zod_1.z.string().url("Image must be a valid URL").optional(),
    productCategory: zod_1.z.string().optional(),
    productSubcategory: zod_1.z.string().optional(),
    productSubSubcategory: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
