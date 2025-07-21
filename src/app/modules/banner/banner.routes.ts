import express from 'express';
import { 
  createBanner, 
  getAllBanners, 
  
  getBannerById, 
  updateBannerById, 
  deleteBannerById 
} from './banner.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();



// Create a new banner with image upload
router.post('/', auth('admin'), upload.single('image'), createBanner);

// Get all banners (with optional active filter)
router.get('/', getAllBanners);

// Get a single banner by ID
router.get('/:id', getBannerById);

// Update a banner by ID with optional image upload
router.put('/:id', auth('admin'), upload.single('image'), updateBannerById);

// Delete a banner by ID (soft delete)
router.delete('/:id', auth('admin'), deleteBannerById);

export const bannerRouter = router;
