import express from "express";
import {
  createTableBooking,
  getUserTableBookings,
  getTableBookingById,
  updateTableBookingById,
  cancelTableBooking,
  getAllTableBookings,
  getVendorTableBookings,
  getFilteredTableBookings,
} from "./table-booking.controller";
import { auth } from "../../middlewares/authMiddleware";

const router = express.Router();

// Create a new table booking
router.post("/", auth("user"), createTableBooking);

// Get all bookings for the authenticated user
router.get("/my-bookings", auth("user"), getUserTableBookings);

// Admin route to get all bookings
router.get("/admin", auth("admin"), getAllTableBookings);

// Vendor route to get bookings for their hotels
router.get("/vendor", auth("vendor"), getVendorTableBookings);

// Get filtered bookings with pagination (for reports)
router.get("/", auth("admin", "vendor"), getFilteredTableBookings);

// Get a specific booking by ID
router.get("/:id", auth("admin", "vendor", "user"), getTableBookingById);

// Update a booking by ID
router.put("/:id", auth("admin", "vendor", "user"), updateTableBookingById);

// Cancel a booking
router.patch(
  "/:id/cancel",
  auth("admin", "vendor", "user"),
  cancelTableBooking
);

export const tableBookingRouter = router;
