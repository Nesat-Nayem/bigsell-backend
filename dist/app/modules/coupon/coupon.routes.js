"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const coupon_controller_1 = require("./coupon.controller");
exports.couponRouter = express_1.default.Router();
// Public: apply coupon on a set of items (cart summary)
exports.couponRouter.post('/apply', coupon_controller_1.applyCoupon);
// Admin/Vendor CRUD
exports.couponRouter.get('/', (0, authMiddleware_1.auth)('admin', 'vendor'), coupon_controller_1.listCoupons);
exports.couponRouter.get('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), coupon_controller_1.getCouponById);
exports.couponRouter.post('/', (0, authMiddleware_1.auth)('admin', 'vendor'), coupon_controller_1.createCoupon);
exports.couponRouter.put('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), coupon_controller_1.updateCoupon);
exports.couponRouter.delete('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), coupon_controller_1.deleteCoupon);
