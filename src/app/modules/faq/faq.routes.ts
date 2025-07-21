import express from 'express';
import { 
  createFAQ, 
  getAllFAQs, 
  getFAQById, 
  updateFAQById, 
  deleteFAQById,
  generateFAQAnswer
} from './faq.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

// Create a new FAQ (admin only)
router.post('/', auth('admin'), createFAQ);

// Get all FAQs (public)
router.get('/', getAllFAQs);

// Get a single FAQ by ID (public)
router.get('/:id', getFAQById);

// Update a FAQ by ID (admin only)
router.put('/:id', auth('admin'), updateFAQById);

// Delete a FAQ by ID (admin only)
router.delete('/:id', auth('admin'), deleteFAQById);

// Generate FAQ answer using AI
router.post('/generate-answer', auth('admin'), generateFAQAnswer);

export const faqRouter = router;