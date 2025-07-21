import mongoose, { Schema } from 'mongoose';
import { IQRCode } from './qrcode.interface';

const QRCodeSchema: Schema = new Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available',
    },
    
    
    
    qrCodeImage: {
      type: String,
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      },
    },
  }
);

// Create compound index to ensure unique table numbers per hotel
QRCodeSchema.index({ tableNumber: 1, hotelId: 1 }, { unique: true });

export const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema); 
