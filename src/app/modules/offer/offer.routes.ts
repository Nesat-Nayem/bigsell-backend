import express from 'express';
import { 
  createOffer, 
  getAllOffers, 
  getOfferById, 
  updateOfferById, 
  deleteOfferById 
} from './offer.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

// Create a new offer with image upload
router.post('/', auth('admin'), upload.single('image'), createOffer);

// Get all offers (with optional active filter)
router.get('/', getAllOffers);

// Get a single offer by ID
router.get('/:id', auth('user'), getOfferById);

// Update an offer by ID with optional image upload
router.put('/:id', auth('admin'), upload.single('image'), updateOfferById);

// Delete an offer by ID (soft delete)
router.delete('/:id', auth('admin'), deleteOfferById);

export const offerRouter = router;
