"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableBookingUpdateValidation = exports.tableBookingValidation = void 0;
const zod_1 = require("zod");
exports.tableBookingValidation = zod_1.z.object({
    hotelId: zod_1.z.string().min(1, 'Hotel ID is required'),
    tableId: zod_1.z.string().min(1, 'Table ID is required'),
    tableNumber: zod_1.z.string().min(1, 'Table number is required'),
    seatNumber: zod_1.z.number().min(1, 'Seat number is required'),
    guestCount: zod_1.z.number().min(1, 'At least 1 guest is required'),
    date: zod_1.z.string().min(1, 'Date is required'),
    time: zod_1.z.string().min(1, 'Time is required'),
    mealType: zod_1.z.string(),
    offerApplied: zod_1.z.string().optional(),
    offerDiscount: zod_1.z.string().optional(),
    coverCharge: zod_1.z.number().optional(),
    bookingPrice: zod_1.z.number().optional(),
    paymentStatus: zod_1.z.string().optional(),
    specialRequests: zod_1.z.string().optional()
});
exports.tableBookingUpdateValidation = zod_1.z.object({
    status: zod_1.z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).optional(),
    specialRequests: zod_1.z.string().optional()
});
