import { z } from "zod";

// Schema for category attributes
const attributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  // Allow 'text' as used by admin UI, alongside other types
  type: z.enum([
    "text",
    "string",
    "number",
    "boolean",
    "select",
    "multiselect",
    "date",
  ]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

// Helper to allow null or undefined for fields that controller may set to null
const nullableString = z.union([z.string(), z.null()]);
const nullableStringOptional = z.union([z.string(), z.null()]).optional();

export const categoryValidation = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z.string().optional(),
  // image can be a URL string or null (if no file uploaded)
  image: nullableStringOptional.transform((val) => (val === "" ? null : val)),
  icon: z.string().optional(),
  // parentId optional and can be null (root category)
  parentId: z.string().nullable().optional(),
  attributes: z.array(attributeSchema).default([]),
  displayOrder: z
    .preprocess((val) => {
      // accept strings too (e.g., "0" from form-data)
      if (typeof val === "string" && val.trim() !== "")
        return parseInt(val, 10);
      return val;
    }, z.number().int().min(0))
    .default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
});

export const categoryUpdateValidation = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters long")
    .optional(),
  description: z.string().optional(),
  image: nullableStringOptional
    .transform((val) => (val === "" ? null : val))
    .optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  attributes: z.array(attributeSchema).optional(),
  displayOrder: z
    .preprocess((val) => {
      if (val === undefined) return undefined;
      if (typeof val === "string" && val.trim() !== "")
        return parseInt(val, 10);
      return val;
    }, z.number().int().min(0).optional())
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

// Validation for creating predefined category templates
export const categoryTemplateValidation = z.object({
  categoryType: z.enum([
    "fashion",
    "electronics",
    "furniture",
    "books",
    "sports",
    "home",
    "beauty",
    "automotive",
  ]),
  includeDefaultAttributes: z.boolean().default(true),
});
