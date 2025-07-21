import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategoryById, 
  deleteCategoryById 
} from './category.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new category with image upload
router.post('/', auth('admin'), upload.single('image'), createCategory);

// Get all categories
router.get('/', getAllCategories);

// Get a single category by ID
router.get('/:id', getCategoryById);

// Update a category by ID with optional image upload
router.put('/:id', auth('admin'), upload.single('image'), updateCategoryById);

// Delete a category by ID (soft delete)
router.delete('/:id', auth('admin'), deleteCategoryById);

export const categoryRouter = router;
