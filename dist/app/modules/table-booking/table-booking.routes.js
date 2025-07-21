"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableBookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const table_booking_controller_1 = require("./table-booking.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new table booking
router.post("/", (0, authMiddleware_1.auth)("user"), table_booking_controller_1.createTableBooking);
// Get all bookings for the authenticated user
router.get("/my-bookings", (0, authMiddleware_1.auth)("user"), table_booking_controller_1.getUserTableBookings);
// Admin route to get all bookings
router.get("/admin", (0, authMiddleware_1.auth)("admin"), table_booking_controller_1.getAllTableBookings);
// Vendor route to get bookings for their hotels
router.get("/vendor", (0, authMiddleware_1.auth)("vendor"), table_booking_controller_1.getVendorTableBookings);
// Get filtered bookings with pagination (for reports)
router.get("/", (0, authMiddleware_1.auth)("admin", "vendor"), table_booking_controller_1.getFilteredTableBookings);
// Get a specific booking by ID
router.get("/:id", (0, authMiddleware_1.auth)("admin", "vendor", "user"), table_booking_controller_1.getTableBookingById);
// Update a booking by ID
router.put("/:id", (0, authMiddleware_1.auth)("admin", "vendor", "user"), table_booking_controller_1.updateTableBookingById);
// Cancel a booking
router.patch("/:id/cancel", (0, authMiddleware_1.auth)("admin", "vendor", "user"), table_booking_controller_1.cancelTableBooking);
exports.tableBookingRouter = router;
