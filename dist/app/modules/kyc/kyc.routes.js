"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycRouter = void 0;
const express_1 = __importDefault(require("express"));
const kyc_controller_1 = require("./kyc.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Submit KYC (Public - from frontend)
router.post('/submit', kyc_controller_1.submitKYC);
// Document Verification Endpoints
router.post('/verify-aadhaar', kyc_controller_1.verifyAadhaar);
router.post('/verify-aadhaar-otp', kyc_controller_1.verifyAadhaarOTP);
router.post('/verify-pan', kyc_controller_1.verifyPAN);
router.post('/verify-gst', kyc_controller_1.verifyGST);
// Get all KYC submissions (Admin only)
router.get('/all', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.getAllKYCSubmissions);
// Get KYC statistics (Admin only)
router.get('/stats', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.getKYCStats);
// Get verification statistics (Admin only)
router.get('/verification-stats', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.getVerificationStats);
// Health check for verification service
router.get('/health', kyc_controller_1.healthCheck);
// Get vendor's own KYC (Vendor only)
router.get('/my-kyc', (0, authMiddleware_1.auth)('vendor'), kyc_controller_1.getMyKYC);
// Get KYC by ID (Admin only)
router.get('/:id', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.getKYCById);
// Review KYC (Admin only)
router.put('/review/:id', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.reviewKYC);
// Update KYC (Vendor resubmission)
router.put('/update', (0, authMiddleware_1.auth)('vendor'), kyc_controller_1.updateKYC);
// Delete KYC (Admin only)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), kyc_controller_1.deleteKYC);
exports.kycRouter = router;
