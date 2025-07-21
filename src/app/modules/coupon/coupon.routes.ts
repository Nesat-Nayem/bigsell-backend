import express from 'express';
import { 
  createCoupon,
  getVendorCoupons,
  updateCoupon,
  deleteCoupon,
  applyCouponToCart,
  removeCouponFromCart
} from './coupon.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// == Vendor-facing routes ==
router.post('/', auth('vendor'), createCoupon);
router.get('/vendor', auth('vendor'), getVendorCoupons);
router.put('/:id', auth('vendor'), updateCoupon);
router.delete('/:id', auth('vendor'), deleteCoupon);


// == User-facing routes ==
router.post('/apply', auth('user'), applyCouponToCart);
router.post('/remove', auth('user'), removeCouponFromCart);

export const couponRouter = router; 