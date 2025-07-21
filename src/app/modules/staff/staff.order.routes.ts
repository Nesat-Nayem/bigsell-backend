import express from 'express';
import { 
  createStaffOrder, 
  getStaffHotelOrders, 
  updateStaffOrderStatus, 
  getStaffOrderDetails,
  updateStaffOrder
} from './staff.order.controller';
import { auth } from '../../middlewares/authMiddleware';
import { staffMiddleware } from '../../middlewares/staffMiddleware';

const router = express.Router();


// Staff order management routes
router.post('/', auth('staff'), createStaffOrder);

router.get('/', auth('staff'), getStaffHotelOrders);
router.get('/:id', auth('staff'), getStaffOrderDetails);
router.put('/:id', auth('staff'), updateStaffOrder);
router.patch('/:id/status', auth('staff'), updateStaffOrderStatus);

export const staffOrderRouter = router;
