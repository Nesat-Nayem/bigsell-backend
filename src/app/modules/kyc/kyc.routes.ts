import express from 'express';
import { 
  submitKYC, 
  getAllKYCSubmissions, 
  getKYCById, 
  getMyKYC,
  reviewKYC,
  updateKYC,
  deleteKYC,
  getKYCStats,
  verifyAadhaar,
  verifyPAN,
  verifyGST,
  getVerificationStats,
  healthCheck,
  verifyAadhaarOTP
} from './kyc.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Submit KYC (Public - from frontend)
router.post('/submit', submitKYC);

// Document Verification Endpoints
router.post('/verify-aadhaar', verifyAadhaar);
router.post('/verify-aadhaar-otp', verifyAadhaarOTP);
router.post('/verify-pan', verifyPAN);
router.post('/verify-gst', verifyGST);

// Get all KYC submissions (Admin only)
router.get('/all',  auth('admin'), getAllKYCSubmissions);

// Get KYC statistics (Admin only)
router.get('/stats',  auth( 'admin') , getKYCStats);

// Get verification statistics (Admin only)
router.get('/verification-stats', auth('admin'), getVerificationStats);

// Health check for verification service
router.get('/health', healthCheck);

// Get vendor's own KYC (Vendor only)
router.get('/my-kyc',  auth('vendor'), getMyKYC);

// Get KYC by ID (Admin only)
router.get('/:id',  auth( 'admin'), getKYCById);

// Review KYC (Admin only)
router.put('/review/:id', auth( 'admin'), reviewKYC);

// Update KYC (Vendor resubmission)
router.put('/update',  auth('vendor'), updateKYC);

// Delete KYC (Admin only)
router.delete('/:id',  auth( 'admin'), deleteKYC);

export const kycRouter = router;