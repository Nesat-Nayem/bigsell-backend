"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const staff_order_controller_1 = require("./staff.order.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Staff order management routes
router.post('/', (0, authMiddleware_1.auth)('staff'), staff_order_controller_1.createStaffOrder);
router.get('/', (0, authMiddleware_1.auth)('staff'), staff_order_controller_1.getStaffHotelOrders);
router.get('/:id', (0, authMiddleware_1.auth)('staff'), staff_order_controller_1.getStaffOrderDetails);
router.put('/:id', (0, authMiddleware_1.auth)('staff'), staff_order_controller_1.updateStaffOrder);
router.patch('/:id/status', (0, authMiddleware_1.auth)('staff'), staff_order_controller_1.updateStaffOrderStatus);
exports.staffOrderRouter = router;
