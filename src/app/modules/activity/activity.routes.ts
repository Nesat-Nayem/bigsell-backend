import express from 'express';
import {
  getAllActivities,
  getActivitySummary,
  getRecentActivities
} from './activity.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get all activities (admin only)
router.get('/all', auth('admin'), getAllActivities);

// Get activity summary (admin only)
router.get('/summary', auth('admin'), getActivitySummary);

// Get recent activities (admin only)
router.get('/recent', auth('admin'), getRecentActivities);

export default router;
