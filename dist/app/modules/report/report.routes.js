"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("./report.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get dashboard statistics
router.get('/stats', (0, authMiddleware_1.auth)(), report_controller_1.getReportStats);
// Get filtered data
router.get('/orders', (0, authMiddleware_1.auth)(), report_controller_1.getFilteredOrders);
router.get('/bookings', (0, authMiddleware_1.auth)(), report_controller_1.getFilteredBookings);
// Export reports
router.get('/orders/export', (0, authMiddleware_1.auth)(), report_controller_1.exportOrdersReport);
router.get('/bookings/export', (0, authMiddleware_1.auth)(), report_controller_1.exportBookingsReport);
exports.reportRouter = router;
