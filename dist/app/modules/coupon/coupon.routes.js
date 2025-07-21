"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRouter = void 0;
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("./coupon.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// == Vendor-facing routes ==
router.post('/', (0, authMiddleware_1.auth)('vendor'), coupon_controller_1.createCoupon);
router.get('/vendor', (0, authMiddleware_1.auth)('vendor'), coupon_controller_1.getVendorCoupons);
router.put('/:id', (0, authMiddleware_1.auth)('vendor'), coupon_controller_1.updateCoupon);
router.delete('/:id', (0, authMiddleware_1.auth)('vendor'), coupon_controller_1.deleteCoupon);
// == User-facing routes ==
router.post('/apply', (0, authMiddleware_1.auth)('user'), coupon_controller_1.applyCouponToCart);
router.post('/remove', (0, authMiddleware_1.auth)('user'), coupon_controller_1.removeCouponFromCart);
exports.couponRouter = router;
