import express from 'express';
import { 
  createStaff, 
  staffLogin, 
  getVendorStaff, 
  getStaffById, 
  updateStaff, 
  deleteStaff,
  getStaffHotelMenu
} from './staff.controller';
import { 
  
  
  
  getAllMenuItems,
  searchMenuItems
} from './staff.menu.controller';
import { auth } from '../../middlewares/authMiddleware';
import { vendorMiddleware } from '../../middlewares/vendorMiddleware';
import { staffMiddleware } from '../../middlewares/staffMiddleware';


const router = express.Router();

// Staff authentication
router.post('/login', staffLogin);

// Staff menu access
router.get('/menu', auth('staff'), getStaffHotelMenu);
router.get('/menu-items', auth('staff'), getAllMenuItems);
router.get('/menu-search', auth('staff'), searchMenuItems);

// Vendor staff management routes
router.post('/', auth('vendor'), createStaff);
router.get('/', auth('vendor'), getVendorStaff);
router.get('/:id', auth('vendor'), getStaffById);
router.put('/:id', auth('vendor'), updateStaff);
router.delete('/:id', auth('vendor'), deleteStaff);

export const staffRouter = router;
