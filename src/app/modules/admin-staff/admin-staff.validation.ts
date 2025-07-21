import { z } from "zod";

// Regex for Indian mobile numbers
const indianMobileRegex = /^[6-9]\d{9}$/;

// Function to validate and format Indian mobile number
const validateIndianMobile = (phone: string) => {
  // Remove country code +91 or 0 prefix if present
  let cleanedPhone = phone.replace(/^(\+91|0)/, '').trim();
  
  if (!indianMobileRegex.test(cleanedPhone)) {
    throw new Error("Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9");
  }
  
  return cleanedPhone;
};

const permissionsSchema = z.object({
  dashboard: z.boolean().default(false),
  orders: z.boolean().default(false),
  restaurants: z.boolean().default(false),
  tableBookings: z.boolean().default(false),
  vendorKyc: z.boolean().default(false),
  categories: z.boolean().default(false),
  banners: z.boolean().default(false),
  exclusiveOffers: z.boolean().default(false),
  featureOffers: z.boolean().default(false),
  contacts: z.boolean().default(false),
  pricing: z.boolean().default(false),
  blog: z.boolean().default(false),
  qrCodes: z.boolean().default(false),
  faq: z.boolean().default(false),
  privacyPolicy: z.boolean().default(false),
  termsConditions: z.boolean().default(false),
  helpSupport: z.boolean().default(false),
});

export const adminStaffCreateValidation = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
  }),
  permissions: permissionsSchema,
});

export const adminStaffUpdateValidation = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
  }).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  permissions: permissionsSchema.optional(),
});

export const adminStaffLoginValidation = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});