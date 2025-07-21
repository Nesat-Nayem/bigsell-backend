import express from 'express';
import { 
  createMustTry, 
  getAllMustTry, 
  getMustTryById, 
  updateMustTryById, 
  deleteMustTryById 
} from './musttry.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new mustTry item with image upload
router.post('/', auth('admin'), upload.single('image'), createMustTry);

// Get all mustTry items (with optional active filter)
router.get('/', getAllMustTry);

// Get a single mustTry item by ID
router.get('/:id', auth('admin'), getMustTryById);

// Update a mustTry item by ID with optional image upload
router.put('/:id', auth('admin'), upload.single('image'), updateMustTryById);

// Delete a mustTry item by ID (soft delete)
router.delete('/:id', auth('admin'), deleteMustTryById);

export const mustTryRouter = router;