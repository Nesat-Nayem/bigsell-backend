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





export const staffCreateValidation = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
  }),
  hotelId: z.string().min(1, "Hotel ID is required"),
});

export const staffLoginValidation = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export const staffUpdateValidation = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().refine(validateIndianMobile, {
    message: "Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9"
  }).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  hotelId: z.string().min(1, "Hotel ID is required").optional(),
});