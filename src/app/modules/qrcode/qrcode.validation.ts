import { z } from 'zod';

export const qrCodeValidation = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  seatNumber: z.coerce.number().min(1, 'Seat number must be at least 1'),
  hotelId: z.string().min(1, 'Hotel selection is required'),
});

export const bookTableValidation = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
});



