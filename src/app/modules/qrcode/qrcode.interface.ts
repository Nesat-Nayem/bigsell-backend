import mongoose, { Document } from 'mongoose';

export interface IQRCode extends Document {
  tableNumber: string;
  seatNumber: number;
  qrCodeImage: string;
  status: 'available' | 'booked';

  hotelId: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} 



