"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBookings = exports.getAllBookings = exports.bookService = void 0;
const slot_model_1 = require("../slot/slot.model");
const booking_model_1 = require("./booking.model");
const appError_1 = require("../../errors/appError");
const bookService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId, slotId, vehicleType, vehicleBrand, vehicleModel, manufacturingYear, registrationPlate, } = req.body;
        const slot = yield slot_model_1.Slot.findById(slotId);
        if (!slot || slot.isBooked !== "available") {
            return next(new appError_1.appError("Slot is not available", 400));
        }
        const booking = new booking_model_1.Booking({
            customer: req.user._id,
            service: serviceId,
            slot: slotId,
            vehicleType,
            vehicleBrand,
            vehicleModel,
            manufacturingYear,
            registrationPlate,
        });
        yield booking.save();
        slot.isBooked = "booked";
        yield slot.save();
        // Populate the referenced documents data
        const populatedBooking = yield booking_model_1.Booking.findById(booking._id)
            .populate("customer", "name email phone address")
            .populate("service", "name description price duration isDeleted")
            .populate("slot", "service date startTime endTime isBooked");
        res.status(201).json({
            success: true,
            statusCode: 200,
            message: "Booking successful",
            data: populatedBooking,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.bookService = bookService;
const getAllBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.Booking.find()
            .populate("customer", "name email phone address")
            .populate("service")
            .populate("slot");
        if (bookings.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "All bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllBookings = getAllBookings;
const getUserBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_model_1.Booking.find({ customer: req.user._id })
            .populate("service")
            .populate("slot")
            .select("-customer");
        if (bookings.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "User bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserBookings = getUserBookings;
