"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogValidation = exports.blogValidation = void 0;
const zod_1 = require("zod");
exports.blogValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    shortDesc: zod_1.z.string().min(1, 'Short description is required'),
    longDesc: zod_1.z.string().min(1, 'Long description is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    status: zod_1.z.enum(['Active', 'Inactive']).default('Active')
});
exports.updateBlogValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    shortDesc: zod_1.z.string().min(1, 'Short description is required').optional(),
    longDesc: zod_1.z.string().min(1, 'Long description is required').optional(),
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    status: zod_1.z.enum(['Active', 'Inactive']).optional()
});
