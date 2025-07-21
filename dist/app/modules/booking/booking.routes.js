"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const userMiddleware_1 = require("../../middlewares/userMiddleware");
const adminMiddleware_1 = require("../../middlewares/adminMiddleware");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authMiddleware, userMiddleware_1.userMiddleware, booking_controller_1.bookService);
router.get("/", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, booking_controller_1.getAllBookings);
router.get("/my-bookings", authMiddleware_1.authMiddleware, userMiddleware_1.userMiddleware, booking_controller_1.getUserBookings);
exports.bookingRouter = router;
