"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gstVerificationValidation = exports.panVerificationValidation = exports.aadhaarVerificationValidation = exports.kycReviewValidation = exports.kycUpdateValidation = exports.kycValidation = void 0;
const zod_1 = require("zod");
// Regex for Indian mobile numbers
const indianMobileRegex = /^[6-9]\d{9}$/;
// Function to validate and format Indian mobile number
const validateIndianMobile = (phone) => {
    let cleanedPhone = phone.replace(/^(\+91|0)/, '').trim();
    if (!indianMobileRegex.test(cleanedPhone)) {
        throw new Error("Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9");
    }
    return cleanedPhone;
};
// PAN validation regex
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
// GST validation regex
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
exports.kycValidation = zod_1.z.object({
    // Package Information
    selectedPackage: zod_1.z.object({
        _id: zod_1.z.string().min(1, "Package ID is required"),
        name: zod_1.z.string().min(1, "Package name is required"),
        price: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val).refine(val => val >= 0, "Price must be a positive number"),
        displayPrice: zod_1.z.string().min(1, "Display price is required"),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        color: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(), // title and name are the same
    }),
    // Restaurant Information
    restaurantName: zod_1.z.string().min(2, "Restaurant name must be at least 2 characters"),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    phone: zod_1.z.string().refine(validateIndianMobile, {
        message: "Invalid Indian mobile number"
    }),
    shopNo: zod_1.z.string().optional(),
    floor: zod_1.z.string().optional(),
    locality: zod_1.z.string().min(2, "Locality is required"),
    city: zod_1.z.string().min(2, "City is required"),
    landmark: zod_1.z.string().optional(),
    // Document Information
    aadhaarNumber: zod_1.z.string()
        .length(12, "Aadhaar number must be exactly 12 digits")
        .regex(/^\d{12}$/, "Aadhaar number must contain only digits")
        .optional(),
    panNumber: zod_1.z.string().regex(panRegex, "Invalid PAN format"),
    panFullName: zod_1.z.string().min(2, "PAN full name is required"),
    panAddress: zod_1.z.string().min(10, "Business address is required"),
    panUpload: zod_1.z.string().optional(),
    gstRegistered: zod_1.z.enum(['yes', 'no']),
    gstNumber: zod_1.z.string().regex(gstRegex, "Invalid GST format").optional(),
    fssaiNumber: zod_1.z.string().optional(),
    fssaiExpiry: zod_1.z.string().optional(),
    fssaiUpload: zod_1.z.string().optional(),
    // Document Verification Results
    aadhaarVerification: zod_1.z.object({
        documentType: zod_1.z.literal('aadhaar'),
        documentNumber: zod_1.z.string(),
        status: zod_1.z.enum(['verified', 'failed', 'pending']),
        verifiedAt: zod_1.z.date().or(zod_1.z.string().transform(str => new Date(str))),
        verificationId: zod_1.z.string(),
        details: zod_1.z.any().optional(),
        errorCode: zod_1.z.string().optional(),
        errorMessage: zod_1.z.string().optional()
    }).optional(),
    panVerification: zod_1.z.object({
        documentType: zod_1.z.literal('pan'),
        documentNumber: zod_1.z.string(),
        status: zod_1.z.enum(['verified', 'failed', 'pending']),
        verifiedAt: zod_1.z.date().or(zod_1.z.string().transform(str => new Date(str))),
        verificationId: zod_1.z.string(),
        details: zod_1.z.any().optional(),
        errorCode: zod_1.z.string().optional(),
        errorMessage: zod_1.z.string().optional()
    }).optional(),
    gstVerification: zod_1.z.object({
        documentType: zod_1.z.literal('gst'),
        documentNumber: zod_1.z.string(),
        status: zod_1.z.enum(['verified', 'failed', 'pending']),
        verifiedAt: zod_1.z.date().or(zod_1.z.string().transform(str => new Date(str))),
        verificationId: zod_1.z.string(),
        details: zod_1.z.any().optional(),
        errorCode: zod_1.z.string().optional(),
        errorMessage: zod_1.z.string().optional()
    }).optional(),
    documentsVerified: zod_1.z.boolean().optional(),
    verificationCompletedAt: zod_1.z.date().or(zod_1.z.string().transform(str => new Date(str))).optional(),
    // Digital Signature
    signature: zod_1.z.string().optional(),
}).refine((data) => {
    // If GST is registered, GST number is required
    if (data.gstRegistered === 'yes' && !data.gstNumber) {
        return false;
    }
    return true;
}, {
    message: "GST number is required when GST is registered",
    path: ["gstNumber"]
});
exports.kycUpdateValidation = zod_1.z.object({
    // Package Information
    selectedPackage: zod_1.z.object({
        _id: zod_1.z.string().min(1, "Package ID is required"),
        name: zod_1.z.string().min(1, "Package name is required"),
        price: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val).refine(val => val >= 0, "Price must be a positive number"),
        displayPrice: zod_1.z.string().min(1, "Display price is required"),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        color: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
    }).optional(),
    // Restaurant Information
    restaurantName: zod_1.z.string().min(2, "Restaurant name must be at least 2 characters").optional(),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone: zod_1.z.string().refine(validateIndianMobile, {
        message: "Invalid Indian mobile number"
    }).optional(),
    shopNo: zod_1.z.string().optional(),
    floor: zod_1.z.string().optional(),
    locality: zod_1.z.string().min(2, "Locality is required").optional(),
    city: zod_1.z.string().min(2, "City is required").optional(),
    landmark: zod_1.z.string().optional(),
    // Document Information
    panNumber: zod_1.z.string().regex(panRegex, "Invalid PAN format").optional(),
    panFullName: zod_1.z.string().min(2, "PAN full name is required").optional(),
    panAddress: zod_1.z.string().min(10, "Business address is required").optional(),
    panUpload: zod_1.z.string().optional(),
    gstRegistered: zod_1.z.enum(['yes', 'no']).optional(),
    gstNumber: zod_1.z.string().regex(gstRegex, "Invalid GST format").optional(),
    fssaiNumber: zod_1.z.string().optional(),
    fssaiExpiry: zod_1.z.string().optional(),
    fssaiUpload: zod_1.z.string().optional(),
    // Digital Signature
    signature: zod_1.z.string().optional(),
});
exports.kycReviewValidation = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected']),
    adminComments: zod_1.z.record(zod_1.z.string()).optional()
});
// Document Verification Validation Schemas
exports.aadhaarVerificationValidation = zod_1.z.object({
    aadhaarNumber: zod_1.z.string()
        .length(12, "Aadhaar number must be exactly 12 digits")
        .regex(/^\d{12}$/, "Aadhaar number must contain only digits")
});
exports.panVerificationValidation = zod_1.z.object({
    panNumber: zod_1.z.string()
        .length(10, "PAN must be exactly 10 characters")
        .regex(panRegex, "Invalid PAN format. Expected format: AAAAA9999A")
        .transform(val => val.toUpperCase()),
    name: zod_1.z.string()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must not exceed 100 characters")
        .trim()
});
exports.gstVerificationValidation = zod_1.z.object({
    gstNumber: zod_1.z.string()
        .length(15, "GST number must be exactly 15 characters")
        .regex(gstRegex, "Invalid GST format")
        .transform(val => val.toUpperCase())
});
