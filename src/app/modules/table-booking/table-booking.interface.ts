import { Document, Schema } from 'mongoose';


export interface ITableBooking extends Document {
  userId: Schema.Types.ObjectId;
  hotelId: Schema.Types.ObjectId;
  tableId: Schema.Types.ObjectId;
  tableNumber: string;
  seatNumber: number;
  guestCount: number;
  date: Date;
  time: string;
  mealType: string;
  offerApplied: string;
  offerDiscount: string;
  coverCharge: number;
  bookingPrice: number;
  specialRequests: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Completed' | 'Refunded';
  createdAt: Date;
  updatedAt: Date;
}