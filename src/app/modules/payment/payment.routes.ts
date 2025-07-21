import express from 'express';
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  createPackagePaymentOrder, 
  verifyPackagePayment,
  createGenericPaymentOrder,
  verifyGenericPayment,
} from './payment.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a Razorpay order
router.post('/razorpay/create', auth(), createRazorpayOrder);



// Verify Razorpay payment and create order
router.post('/razorpay/verify', auth(), verifyRazorpayPayment);

router.post('/package/create', auth(), createPackagePaymentOrder);
router.post('/package/verify', auth(), verifyPackagePayment);


// New generic payment routes
router.post('/generic/create', auth(), createGenericPaymentOrder as express.RequestHandler);
router.post('/generic/verify', auth(), verifyGenericPayment as express.RequestHandler);
export const paymentRouter = router;
