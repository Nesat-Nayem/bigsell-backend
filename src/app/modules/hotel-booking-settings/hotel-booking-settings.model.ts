import mongoose, { Schema } from 'mongoose';
import { IHotelBookingSettings } from './hotel-booking-settings.interface';

const TimeSlotSchema = new Schema({
  time: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    default: 20
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const MealCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  timeSlots: [TimeSlotSchema]
}, { _id: false });

const BookingOfferSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  discount: {
    type: String,
    required: true
  },
  coverCharge: {
    type: Number,
    default: 0
  },
  applicableTimeSlots: [String],
  applicableDays: [String]
}, { _id: true });

const HotelBookingSettingsSchema: Schema = new Schema(
  {
    hotelId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Hotel',
      required: true,
      unique: true
    },
    baseBookingPrice: {
      type: Number,
      required: true,
      default: 300
    },
    termsAndConditions: {
      type: [String],
      default: [
        "Please arrive 15 minutes prior to your reservation time",
        "Booking valid for the specified number of guests entered during reservation",
        "Cover charges upon entry are subject to the discretion of the restaurant",
        "Additional service charges on the bill are at the restaurant's discretion",
        "Bookings cannot be modified once made",
        "House rules are to be observed at all times",
        "Special requests will be accommodated at the restaurant's discretion"
      ]
    },
    mealCategories: {
      type: [MealCategorySchema],
      default: [
        {
          name: 'Lunch',
          description: 'Enjoy our lunch menu with special afternoon offers',
          timeSlots: [
            { time: '12:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '12:30 PM', maxCapacity: 20, isAvailable: true },
            { time: '1:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '1:30 PM', maxCapacity: 20, isAvailable: true },
            { time: '2:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '2:30 PM', maxCapacity: 20, isAvailable: true }
          ]
        },
        {
          name: 'Dinner',
          description: 'Experience our dinner menu with evening specials',
          timeSlots: [
            { time: '6:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '6:30 PM', maxCapacity: 20, isAvailable: true },
            { time: '7:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '7:30 PM', maxCapacity: 20, isAvailable: true },
            { time: '8:00 PM', maxCapacity: 20, isAvailable: true },
            { time: '8:30 PM', maxCapacity: 20, isAvailable: true }
          ]
        }
      ]
    },
    offers: {
      type: [BookingOfferSchema],
      default: [
        {
          title: 'Early Bird Discount',
          description: 'Flat 25% OFF on total bill',
          discount: '25% OFF',
          coverCharge: 25,
          applicableTimeSlots: ['6:00 PM', '6:30 PM'],
          applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
        },
        {
          title: 'Weekend Special',
          description: 'Flat 10% OFF on total bill',
          discount: '10% OFF',
          coverCharge: 10,
          applicableTimeSlots: ['7:00 PM', '7:30 PM', '8:00 PM'],
          applicableDays: ['Friday', 'Saturday', 'Sunday']
        }
      ]
    },
    advanceBookingDays: {
      type: Number,
      default: 7
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const HotelBookingSettings = mongoose.model<IHotelBookingSettings>('HotelBookingSettings', HotelBookingSettingsSchema);