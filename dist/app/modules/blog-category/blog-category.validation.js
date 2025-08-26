"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogCategoryUpdateValidation = exports.blogCategoryValidation = void 0;
const zod_1 = require("zod");
exports.blogCategoryValidation = zod_1.z.object({
    categoryName: zod_1.z.string().min(1, 'Category name is required'),
    status: zod_1.z.enum(['Active', 'Inactive']).default('Active')
});
exports.blogCategoryUpdateValidation = zod_1.z.object({
    categoryName: zod_1.z.string().min(1, 'Category name is required').optional(),
    status: zod_1.z.enum(['Active', 'Inactive']).optional()
});
