import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponById,
  listCoupons,
  updateCoupon,
} from './coupon.controller';

export const couponRouter = express.Router();

// Public: apply coupon on a set of items (cart summary)
couponRouter.post('/apply', applyCoupon);

// Admin/Vendor CRUD
couponRouter.get('/', auth('admin', 'vendor'), listCoupons);
couponRouter.get('/:id', auth('admin', 'vendor'), getCouponById);
couponRouter.post('/', auth('admin', 'vendor'), createCoupon);
couponRouter.put('/:id', auth('admin', 'vendor'), updateCoupon);
couponRouter.delete('/:id', auth('admin', 'vendor'), deleteCoupon);
