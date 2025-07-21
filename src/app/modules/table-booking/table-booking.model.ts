import mongoose, { Schema } from 'mongoose';
import { ITableBooking } from './table-booking.interface';

const TableBookingSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'QRCode',
      required: true
    },
    tableNumber: {
      type: String,
      required: true
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    mealType: {
      type: String,
      required: true
    },
    offerApplied: {
      type: String,
      default: ''
    },
    offerDiscount: {
      type: String,
      default: ''
    },
    coverCharge: {
      type: Number,
      default: 0
    },
    bookingPrice: {
      type: Number,
      required: true,
      default: 300
    },
    specialRequests: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Refunded'],
      default: 'Pending'
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


export const TableBooking = mongoose.model<ITableBooking>('TableBooking', TableBookingSchema);