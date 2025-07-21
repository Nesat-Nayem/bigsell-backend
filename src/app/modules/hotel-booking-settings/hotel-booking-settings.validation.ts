import { z } from 'zod';

const timeSlotSchema = z.object({
  time: z.string().min(1, 'Time is required'),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
  isAvailable: z.boolean().optional()
});

const mealCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  timeSlots: z.array(timeSlotSchema)
});

const bookingOfferSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  discount: z.string().min(1, 'Discount is required'),
  coverCharge: z.number().min(0, 'Cover charge must be non-negative'),
  applicableTimeSlots: z.array(z.string()),
  applicableDays: z.array(z.string())
});

export const hotelBookingSettingsValidation = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  baseBookingPrice: z.number().min(0, 'Base booking price must be non-negative'),
  termsAndConditions: z.array(z.string()),
  mealCategories: z.array(mealCategorySchema),
  offers: z.array(bookingOfferSchema),
  advanceBookingDays: z.number().min(1, 'Advance booking days must be at least 1'),
  isActive: z.boolean().optional()
});

export const hotelBookingSettingsUpdateValidation = hotelBookingSettingsValidation.partial();