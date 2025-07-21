import express from 'express';
import { 
  createFeatureOffer, 
  getAllFeatureOffers, 
  getFeatureOfferById, 
  updateFeatureOfferById, 
  deleteFeatureOfferById 
} from './feature-offer.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

// Create a new feature offer with image upload
router.post('/', auth('admin'), upload.single('image'), createFeatureOffer);

// Get all feature offers (with optional active filter)
router.get('/', getAllFeatureOffers);

// Get a single feature offer by ID
router.get('/:id', getFeatureOfferById);

// Update a feature offer by ID with optional image upload
router.put('/:id', auth('admin'), upload.single('image'), updateFeatureOfferById);

// Delete a feature offer by ID (soft delete)
router.delete('/:id', auth('admin'), deleteFeatureOfferById);

export const featureOfferRouter = router;