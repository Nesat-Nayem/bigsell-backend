"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookTableValidation = exports.qrCodeValidation = void 0;
const zod_1 = require("zod");
exports.qrCodeValidation = zod_1.z.object({
    tableNumber: zod_1.z.string().min(1, 'Table number is required'),
    seatNumber: zod_1.z.coerce.number().min(1, 'Seat number must be at least 1'),
    hotelId: zod_1.z.string().min(1, 'Hotel selection is required'),
});
exports.bookTableValidation = zod_1.z.object({
    hotelId: zod_1.z.string().min(1, 'Hotel ID is required'),
    tableNumber: zod_1.z.string().min(1, 'Table number is required'),
});
