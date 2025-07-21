"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelBookingSettingsUpdateValidation = exports.hotelBookingSettingsValidation = void 0;
const zod_1 = require("zod");
const timeSlotSchema = zod_1.z.object({
    time: zod_1.z.string().min(1, 'Time is required'),
    maxCapacity: zod_1.z.number().min(1, 'Capacity must be at least 1'),
    isAvailable: zod_1.z.boolean().optional()
});
const mealCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    timeSlots: zod_1.z.array(timeSlotSchema)
});
const bookingOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    discount: zod_1.z.string().min(1, 'Discount is required'),
    coverCharge: zod_1.z.number().min(0, 'Cover charge must be non-negative'),
    applicableTimeSlots: zod_1.z.array(zod_1.z.string()),
    applicableDays: zod_1.z.array(zod_1.z.string())
});
exports.hotelBookingSettingsValidation = zod_1.z.object({
    hotelId: zod_1.z.string().min(1, 'Hotel ID is required'),
    baseBookingPrice: zod_1.z.number().min(0, 'Base booking price must be non-negative'),
    termsAndConditions: zod_1.z.array(zod_1.z.string()),
    mealCategories: zod_1.z.array(mealCategorySchema),
    offers: zod_1.z.array(bookingOfferSchema),
    advanceBookingDays: zod_1.z.number().min(1, 'Advance booking days must be at least 1'),
    isActive: zod_1.z.boolean().optional()
});
exports.hotelBookingSettingsUpdateValidation = exports.hotelBookingSettingsValidation.partial();
