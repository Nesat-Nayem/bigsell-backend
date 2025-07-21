"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelBookingSettingsRouter = void 0;
const express_1 = __importDefault(require("express"));
const hotel_booking_settings_controller_1 = require("./hotel-booking-settings.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create booking settings for a hotel (admin or vendor only)
router.post('/', (0, authMiddleware_1.auth)('vendor'), hotel_booking_settings_controller_1.createHotelBookingSettings);
// Get available time slots for a specific date and meal type
router.get('/available-slots', hotel_booking_settings_controller_1.getAvailableTimeSlots);
// Get booking settings for a hotel (public)
router.get('/:hotelId', hotel_booking_settings_controller_1.getHotelBookingSettings);
// Update booking settings for a hotel (admin or vendor only)
router.put('/:hotelId', (0, authMiddleware_1.auth)('admin', 'vendor'), hotel_booking_settings_controller_1.updateHotelBookingSettings);
exports.hotelBookingSettingsRouter = router;
