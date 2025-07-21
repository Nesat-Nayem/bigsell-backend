import express from 'express';
import { 
  createSaveCard, 
  getAllSaveCards, 
  getSaveCardById, 
  updateSaveCardById, 
  deleteSaveCardById 
} from './savecard.controller';
import { auth } from '../../middlewares/authMiddleware';


const router = express.Router();

// Create a new saved card
router.post('/',  auth('user'), createSaveCard);

// Get all saved cards for the authenticated user
router.get('/', auth('user'), getAllSaveCards);

// Get a single saved card by ID
router.get('/:id', auth('user'), getSaveCardById);

// Update a saved card by ID
router.put('/:id', auth('user'), updateSaveCardById);

// Delete a saved card by ID (soft delete)
router.delete('/:id', auth('user'), deleteSaveCardById);

export const saveCardRouter = router;