import { Document, Schema } from 'mongoose';

interface TimeSlot {
  time: string;
  maxCapacity: number;
  isAvailable: boolean;
}

interface MealCategory {
  name: string;
  description: string;
  timeSlots: TimeSlot[];
}

interface BookingOffer {
  title: string;
  description: string;
  discount: string;
  coverCharge: number;
  applicableTimeSlots: string[]; // Array of time strings
  applicableDays: string[]; // Array of days like "Monday", "Tuesday", etc.
}

export interface IHotelBookingSettings extends Document {
  hotelId: Schema.Types.ObjectId;
  baseBookingPrice: number;
  termsAndConditions: string[];
  mealCategories: MealCategory[];
  offers: BookingOffer[];
  advanceBookingDays: number; // How many days in advance booking is allowed
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}