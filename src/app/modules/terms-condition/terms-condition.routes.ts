import express from 'express';
import { getTermsCondition, updateTermsCondition } from './terms-condition.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

// Get privacy policy (public)
router.get('/', getTermsCondition);

// Update privacy policy (admin only)
router.put('/', auth('admin'), updateTermsCondition);

export const TermsConditionRouter = router;