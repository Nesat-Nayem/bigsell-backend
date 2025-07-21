import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy } from './privacy-policy.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

// Get privacy policy (public)
router.get('/', getPrivacyPolicy);

// Update privacy policy (admin only)
router.put('/', auth('admin'), updatePrivacyPolicy);


export const privacyPolicyRouter = router;