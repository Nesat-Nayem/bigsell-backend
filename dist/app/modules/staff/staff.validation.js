"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffUpdateValidation = exports.staffLoginValidation = exports.staffCreateValidation = void 0;
const zod_1 = require("zod");
// Regex for Indian mobile numbers
const indianMobileRegex = /^[6-9]\d{9}$/;
// Function to validate and format Indian mobile number
const validateIndianMobile = (phone) => {
    // Remove country code +91 or 0 prefix if present
    let cleanedPhone = phone.replace(/^(\+91|0)/, '').trim();
    if (!indianMobileRegex.test(cleanedPhone)) {
        throw new Error("Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9");
    }
    return cleanedPhone;
};
exports.staffCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().refine(validateIndianMobile, {
        message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
    }),
    hotelId: zod_1.z.string().min(1, "Hotel ID is required"),
});
exports.staffLoginValidation = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required")
});
exports.staffUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone: zod_1.z.string().refine(validateIndianMobile, {
        message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
    }).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    hotelId: zod_1.z.string().min(1, "Hotel ID is required").optional(),
});
