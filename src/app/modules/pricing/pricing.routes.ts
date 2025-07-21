import express from 'express';
import { 
  createPricing, 
  getAllPricingPlans, 
  getPricingPlanById, 
  updatePricingPlanById, 
  deletePricingPlanById 
} from './pricing.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get all pricing plans
router.get('/', getAllPricingPlans);

// Create a new pricing plan (Admin only)
router.post('/', auth('admin'), createPricing);

// Get a single pricing plan by ID
router.get('/:id', getPricingPlanById);

// Update a pricing plan by ID (Admin only)
router.put('/:id', auth('admin'), updatePricingPlanById);

// Delete a pricing plan by ID (Admin only)
router.delete('/:id', auth('admin'), deletePricingPlanById);

export const pricingRouter = router;