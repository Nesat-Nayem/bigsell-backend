import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  updatePaymentStatus,
  getAllOrders,
  getDashboardStats,
  updateOrderItemStatus,
  recordManualPayment,
  completeOrder,
  payForItems
} from './order.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();


// Create a new order
router.post('/', auth('user', 'vendor'), createOrder);

// Get dashboard statistics (admin and vendor)
router.get('/dashboard-stats', auth('admin', 'vendor'), getDashboardStats);

// Get all orders for current user
router.get('/my-orders', auth('user', 'vendor'), getUserOrders);

// Get a specific order (admin, vendor, or order owner)
router.get('/:id', auth('admin', 'vendor', 'user'), getOrderById);

// Update payment status
router.patch('/:id/payment', auth('admin', 'vendor'), updatePaymentStatus);

// Get all orders (admin and vendor)
router.get('/', auth('admin', 'vendor'), getAllOrders);

// Update order status (admin and vendor)
router.patch('/:id/status', auth('admin', 'vendor'), updateOrderStatus);

// Update a specific item's status in an order
router.patch('/:orderId/items/:itemId/status', auth('admin', 'vendor'), updateOrderItemStatus);

// Record a manual payment for an order
router.post('/:orderId/manual-payment', auth('admin', 'vendor'), recordManualPayment);

// Complete an order and free up the table
router.post('/:orderId/complete', auth('user', 'admin', 'vendor'), completeOrder);

// Allow a user to pay for specific items in an order
router.post('/:orderId/pay-for-items', auth('user', 'vendor'), payForItems);

export const orderRouter = router;
