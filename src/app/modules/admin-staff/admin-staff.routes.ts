import express from 'express';
import { 
  createAdminStaff, 
  adminStaffLogin,
  getAdminStaff, 
  getAdminStaffById, 
  updateAdminStaff, 
  deleteAdminStaff,
  restoreAdminStaff
} from './admin-staff.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Admin staff authentication
router.post('/login', adminStaffLogin);

// Admin staff management routes (Admin only)
router.post('/', auth('admin'), createAdminStaff);
router.get('/', auth('admin'), getAdminStaff);
router.get('/:id', auth('admin'), getAdminStaffById);
router.put('/:id', auth('admin'), updateAdminStaff);
router.delete('/:id', auth('admin'), deleteAdminStaff);
router.put('/:id/restore', auth('admin'), restoreAdminStaff);

export const adminStaffRouter = router;