"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productUpdateValidation = exports.productValidation = void 0;
const zod_1 = require("zod");
const sizeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Size name is required'),
    price: zod_1.z.number().min(0, 'Price must be a positive number')
});
const addonSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Addon name is required'),
    key: zod_1.z.string().min(1, 'Addon key is required'),
    price: zod_1.z.number().min(0, 'Price must be a positive number'),
    image: zod_1.z.string().min(1, 'Addon image is required')
});
exports.productValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    sizes: zod_1.z.array(sizeSchema).min(1, 'At least one size is required'),
    addons: zod_1.z.array(addonSchema).optional()
});
exports.productUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required').optional(),
    description: zod_1.z.string().min(1, 'Description is required').optional(),
    image: zod_1.z.string().min(1, 'Image is required').optional(),
    category: zod_1.z.string().min(1, 'Category is required').optional(),
    sizes: zod_1.z.array(sizeSchema).min(1, 'At least one size is required').optional(),
    addons: zod_1.z.array(addonSchema).optional()
});
