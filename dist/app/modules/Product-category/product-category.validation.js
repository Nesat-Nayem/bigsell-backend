"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryTemplateValidation = exports.categoryUpdateValidation = exports.categoryValidation = void 0;
const zod_1 = require("zod");
// Schema for category attributes
const attributeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Attribute name is required"),
    // Allow 'text' as used by admin UI, alongside other types
    type: zod_1.z.enum([
        "text",
        "string",
        "number",
        "boolean",
        "select",
        "multiselect",
        "date",
    ]),
    required: zod_1.z.boolean().default(false),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    defaultValue: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]).optional(),
});
// Helper to allow null or undefined for fields that controller may set to null
const nullableString = zod_1.z.union([zod_1.z.string(), zod_1.z.null()]);
const nullableStringOptional = zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional();
exports.categoryValidation = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters long"),
    description: zod_1.z.string().optional(),
    // image can be a URL string or null (if no file uploaded)
    image: nullableStringOptional.transform((val) => (val === "" ? null : val)),
    icon: zod_1.z.string().optional(),
    // parentId optional and can be null (root category)
    parentId: zod_1.z.string().nullable().optional(),
    attributes: zod_1.z.array(attributeSchema).default([]),
    displayOrder: zod_1.z
        .preprocess((val) => {
        // accept strings too (e.g., "0" from form-data)
        if (typeof val === "string" && val.trim() !== "")
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0))
        .default(0),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    seoKeywords: zod_1.z.array(zod_1.z.string()).default([]),
    isActive: zod_1.z.boolean().default(true),
    isDeleted: zod_1.z.boolean().default(false),
});
exports.categoryUpdateValidation = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(2, "Title must be at least 2 characters long")
        .optional(),
    description: zod_1.z.string().optional(),
    image: nullableStringOptional
        .transform((val) => (val === "" ? null : val))
        .optional(),
    icon: zod_1.z.string().optional(),
    parentId: zod_1.z.string().nullable().optional(),
    attributes: zod_1.z.array(attributeSchema).optional(),
    displayOrder: zod_1.z
        .preprocess((val) => {
        if (val === undefined)
            return undefined;
        if (typeof val === "string" && val.trim() !== "")
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).optional())
        .optional(),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    seoKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
// Validation for creating predefined category templates
exports.categoryTemplateValidation = zod_1.z.object({
    categoryType: zod_1.z.enum([
        "fashion",
        "electronics",
        "furniture",
        "books",
        "sports",
        "home",
        "beauty",
        "automotive",
    ]),
    includeDefaultAttributes: zod_1.z.boolean().default(true),
});
