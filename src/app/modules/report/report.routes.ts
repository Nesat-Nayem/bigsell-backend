import express from 'express';
import {
    getReportStats,
    getFilteredOrders,
    getFilteredBookings,
    exportOrdersReport,
    exportBookingsReport
} from './report.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth(), getReportStats);

// Get filtered data
router.get('/orders', auth(), getFilteredOrders);
router.get('/bookings', auth(), getFilteredBookings);

// Export reports
router.get('/orders/export', auth(), exportOrdersReport);
router.get('/bookings/export', auth(), exportBookingsReport);

export const reportRouter = router;
