"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressValidation = exports.createAddressValidation = void 0;
const zod_1 = require("zod");
exports.createAddressValidation = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Full name is required"),
    phone: zod_1.z.string().min(10, "Phone number is required"),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    addressLine1: zod_1.z.string().min(1, "Address line 1 is required"),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    postalCode: zod_1.z.string().min(1, "Postal code is required"),
    country: zod_1.z.string().default("India"),
    isDefault: zod_1.z.boolean().default(false),
    addressType: zod_1.z.enum(["home", "work", "other"]).default("home"),
});
exports.updateAddressValidation = zod_1.z.object({
    fullName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(10).optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    addressLine1: zod_1.z.string().min(1).optional(),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1).optional(),
    state: zod_1.z.string().min(1).optional(),
    postalCode: zod_1.z.string().min(1).optional(),
    country: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().optional(),
    addressType: zod_1.z.enum(["home", "work", "other"]).optional(),
});
