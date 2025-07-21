import express from 'express';
import { 
  createHotelBookingSettings, 
  getHotelBookingSettings, 
  updateHotelBookingSettings,
  getAvailableTimeSlots
} from './hotel-booking-settings.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create booking settings for a hotel (admin or vendor only)
router.post('/', auth('vendor'), createHotelBookingSettings);

// Get available time slots for a specific date and meal type
router.get('/available-slots', getAvailableTimeSlots);

// Get booking settings for a hotel (public)
router.get('/:hotelId', getHotelBookingSettings);

// Update booking settings for a hotel (admin or vendor only)
router.put('/:hotelId', auth('admin','vendor'), updateHotelBookingSettings);


export const hotelBookingSettingsRouter = router;