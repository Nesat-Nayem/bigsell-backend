"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a Razorpay order
router.post('/razorpay/create', (0, authMiddleware_1.auth)(), payment_controller_1.createRazorpayOrder);
// Verify Razorpay payment and create order
router.post('/razorpay/verify', (0, authMiddleware_1.auth)(), payment_controller_1.verifyRazorpayPayment);
router.post('/package/create', (0, authMiddleware_1.auth)(), payment_controller_1.createPackagePaymentOrder);
router.post('/package/verify', (0, authMiddleware_1.auth)(), payment_controller_1.verifyPackagePayment);
// New generic payment routes
router.post('/generic/create', (0, authMiddleware_1.auth)(), payment_controller_1.createGenericPaymentOrder);
router.post('/generic/verify', (0, authMiddleware_1.auth)(), payment_controller_1.verifyGenericPayment);
exports.paymentRouter = router;
