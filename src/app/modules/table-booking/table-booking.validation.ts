import { z } from 'zod';

export const tableBookingValidation = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  tableId: z.string().min(1, 'Table ID is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
  seatNumber: z.number().min(1, 'Seat number is required'),
  guestCount: z.number().min(1, 'At least 1 guest is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  mealType: z.string(),
  offerApplied: z.string().optional(),
  offerDiscount: z.string().optional(),
  coverCharge: z.number().optional(),
  bookingPrice: z.number().optional(),
  paymentStatus: z.string().optional(),
  specialRequests: z.string().optional()
});


export const tableBookingUpdateValidation = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).optional(),
  specialRequests: z.string().optional()
});