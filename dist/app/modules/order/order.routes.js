"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("./order.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new order
router.post('/', (0, authMiddleware_1.auth)('user', 'vendor'), order_controller_1.createOrder);
// Get dashboard statistics (admin and vendor)
router.get('/dashboard-stats', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.getDashboardStats);
// Get all orders for current user
router.get('/my-orders', (0, authMiddleware_1.auth)('user', 'vendor'), order_controller_1.getUserOrders);
// Get a specific order (admin, vendor, or order owner)
router.get('/:id', (0, authMiddleware_1.auth)('admin', 'vendor', 'user'), order_controller_1.getOrderById);
// Update payment status
router.patch('/:id/payment', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.updatePaymentStatus);
// Get all orders (admin and vendor)
router.get('/', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.getAllOrders);
// Update order status (admin and vendor)
router.patch('/:id/status', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.updateOrderStatus);
// Update a specific item's status in an order
router.patch('/:orderId/items/:itemId/status', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.updateOrderItemStatus);
// Record a manual payment for an order
router.post('/:orderId/manual-payment', (0, authMiddleware_1.auth)('admin', 'vendor'), order_controller_1.recordManualPayment);
// Complete an order and free up the table
router.post('/:orderId/complete', (0, authMiddleware_1.auth)('user', 'admin', 'vendor'), order_controller_1.completeOrder);
// Allow a user to pay for specific items in an order
router.post('/:orderId/pay-for-items', (0, authMiddleware_1.auth)('user', 'vendor'), order_controller_1.payForItems);
exports.orderRouter = router;
