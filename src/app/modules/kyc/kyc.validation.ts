import { z } from "zod";

// Regex for Indian mobile numbers
const indianMobileRegex = /^[6-9]\d{9}$/;

// Function to validate and format Indian mobile number
const validateIndianMobile = (phone: string) => {
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

export const kycValidation = z.object({
  // Package Information
  selectedPackage: z.object({
    _id: z.string().min(1, "Package ID is required"),
    name: z.string().min(1, "Package name is required"),
    price: z.union([z.number(), z.string()]).transform(val => 
        typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val
    ).refine(val => val >= 0, "Price must be a positive number"),
    displayPrice: z.string().min(1, "Display price is required"),
    features: z.array(z.string()).optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    title: z.string().optional(), // title and name are the same
  }),

  // Restaurant Information
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number"
  }),
  shopNo: z.string().optional(),
  floor: z.string().optional(),
  locality: z.string().min(2, "Locality is required"),
  city: z.string().min(2, "City is required"),
  landmark: z.string().optional(),

  // Document Information
  aadhaarNumber: z.string()
    .length(12, "Aadhaar number must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhaar number must contain only digits")
    .optional(),
  panNumber: z.string().regex(panRegex, "Invalid PAN format"),
  panFullName: z.string().min(2, "PAN full name is required"),
  panAddress: z.string().min(10, "Business address is required"),
  panUpload: z.string().optional(),

  gstRegistered: z.enum(['yes', 'no']),
  gstNumber: z.string().regex(gstRegex, "Invalid GST format").optional(),
  
  fssaiNumber: z.string().optional(),
  fssaiExpiry: z.string().optional(),
  fssaiUpload: z.string().optional(),

  // Document Verification Results
  aadhaarVerification: z.object({
    documentType: z.literal('aadhaar'),
    documentNumber: z.string(),
    status: z.enum(['verified', 'failed', 'pending']),
    verifiedAt: z.date().or(z.string().transform(str => new Date(str))),
    verificationId: z.string(),
    details: z.any().optional(),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional()
  }).optional(),
  
  panVerification: z.object({
    documentType: z.literal('pan'),
    documentNumber: z.string(),
    status: z.enum(['verified', 'failed', 'pending']),
    verifiedAt: z.date().or(z.string().transform(str => new Date(str))),
    verificationId: z.string(),
    details: z.any().optional(),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional()
  }).optional(),
  
  gstVerification: z.object({
    documentType: z.literal('gst'),
    documentNumber: z.string(),
    status: z.enum(['verified', 'failed', 'pending']),
    verifiedAt: z.date().or(z.string().transform(str => new Date(str))),
    verificationId: z.string(),
    details: z.any().optional(),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional()
  }).optional(),
  
  documentsVerified: z.boolean().optional(),
  verificationCompletedAt: z.date().or(z.string().transform(str => new Date(str))).optional(),

  // Digital Signature
  signature: z.string().optional(),
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

export const kycUpdateValidation = z.object({
  // Package Information
  selectedPackage: z.object({
    _id: z.string().min(1, "Package ID is required"),
    name: z.string().min(1, "Package name is required"),
    price: z.union([z.number(), z.string()]).transform(val => 
        typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val
    ).refine(val => val >= 0, "Price must be a positive number"),
    displayPrice: z.string().min(1, "Display price is required"),
    features: z.array(z.string()).optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    title: z.string().optional(),
  }).optional(),

  // Restaurant Information
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number"
  }).optional(),
  shopNo: z.string().optional(),
  floor: z.string().optional(),
  locality: z.string().min(2, "Locality is required").optional(),
  city: z.string().min(2, "City is required").optional(),
  landmark: z.string().optional(),

  // Document Information
  panNumber: z.string().regex(panRegex, "Invalid PAN format").optional(),
  panFullName: z.string().min(2, "PAN full name is required").optional(),
  panAddress: z.string().min(10, "Business address is required").optional(),
  panUpload: z.string().optional(),

  gstRegistered: z.enum(['yes', 'no']).optional(),
  gstNumber: z.string().regex(gstRegex, "Invalid GST format").optional(),
  
  fssaiNumber: z.string().optional(),
  fssaiExpiry: z.string().optional(),
  fssaiUpload: z.string().optional(),

  // Digital Signature
  signature: z.string().optional(),
});

export const kycReviewValidation = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminComments: z.record(z.string()).optional()
});

// Document Verification Validation Schemas

export const aadhaarVerificationValidation = z.object({
  aadhaarNumber: z.string()
    .length(12, "Aadhaar number must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhaar number must contain only digits")
});

export const panVerificationValidation = z.object({
  panNumber: z.string()
    .length(10, "PAN must be exactly 10 characters")
    .regex(panRegex, "Invalid PAN format. Expected format: AAAAA9999A")
    .transform(val => val.toUpperCase()),
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .trim()
});

export const gstVerificationValidation = z.object({
  gstNumber: z.string()
    .length(15, "GST number must be exactly 15 characters")
    .regex(gstRegex, "Invalid GST format")
    .transform(val => val.toUpperCase())
});