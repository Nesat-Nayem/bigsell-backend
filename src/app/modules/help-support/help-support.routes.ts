import express from 'express';
import { getHelpSupport, updateHelpSupport } from './help-support.controller';
import { auth } from '../../middlewares/authMiddleware';


const router = express.Router();

// Get help and support content (public)
router.get('/', getHelpSupport);

// Update help and support content (admin only)
router.put('/', auth('admin'), updateHelpSupport);

export const helpSupportRouter = router;