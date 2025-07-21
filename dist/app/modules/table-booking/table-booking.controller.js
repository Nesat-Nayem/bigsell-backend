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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredTableBookings = exports.getVendorTableBookings = exports.getAllTableBookings = exports.cancelTableBooking = exports.updateTableBookingById = exports.getTableBookingById = exports.getUserTableBookings = exports.createTableBooking = void 0;
const table_booking_model_1 = require("./table-booking.model");
const table_booking_validation_1 = require("./table-booking.validation");
const appError_1 = require("../../errors/appError");
const mongoose_1 = __importDefault(require("mongoose"));
const createTableBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, tableId, tableNumber, seatNumber, guestCount, date, time, mealType, offerApplied, offerDiscount, coverCharge, bookingPrice, paymentStatus, specialRequests } = req.body;
        // Get user ID from authenticated user
        const userId = req.user._id;
        // Get hotel booking settings (use provided bookingPrice or fallback to settings/default)
        const bookingSettings = yield mongoose_1.default.model('HotelBookingSettings').findOne({ hotelId });
        const finalBookingPrice = bookingPrice || (bookingSettings === null || bookingSettings === void 0 ? void 0 : bookingSettings.baseBookingPrice) || 300;
        // Validate the input
        const validatedData = table_booking_validation_1.tableBookingValidation.parse({
            hotelId,
            tableId,
            tableNumber,
            seatNumber: Number(seatNumber),
            guestCount: Number(guestCount),
            date,
            time,
            mealType,
            offerApplied,
            offerDiscount,
            coverCharge: Number(coverCharge || 0),
            bookingPrice: Number(finalBookingPrice),
            paymentStatus,
            specialRequests
        });
        // Check if table is available before booking
        const table = yield mongoose_1.default.model('QRCode').findById(tableId);
        if (!table) {
            return next(new appError_1.appError("Table not found", 404));
        }
        if (table.status === 'booked') {
            return next(new appError_1.appError("Table is already booked", 400));
        }
        // Use a transaction to ensure both operations succeed or fail together
        const session = yield mongoose_1.default.startSession();
        let tableBooking;
        try {
            yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                // Create a new table booking
                tableBooking = new table_booking_model_1.TableBooking(Object.assign(Object.assign({ userId }, validatedData), { date: new Date(validatedData.date) }));
                yield tableBooking.save({ session });
                // Update table status to booked
                const updatedTable = yield mongoose_1.default.model('QRCode').findByIdAndUpdate(tableId, { status: 'booked' }, { new: true, session });
                if (!updatedTable) {
                    throw new Error('Failed to update table status');
                }
            }));
        }
        catch (error) {
            console.error('Transaction failed:', error);
            return next(new appError_1.appError("Failed to create booking and update table status", 500));
        }
        finally {
            yield session.endSession();
        }
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Table booking created successfully",
            data: tableBooking,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createTableBooking = createTableBooking;
const getUserTableBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user ID from authenticated user
        const userId = req.user._id;
        // Get bookings for the user
        const bookings = yield table_booking_model_1.TableBooking.find({ userId })
            .populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: "User table bookings retrieved successfully",
            data: bookings,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getUserTableBookings = getUserTableBookings;
const getTableBookingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
            return next(new appError_1.appError("Invalid booking ID", 400));
        }
        // Get the booking
        const booking = yield table_booking_model_1.TableBooking.findById(bookingId)
            .populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status');
        if (!booking) {
            return next(new appError_1.appError("Booking not found", 404));
        }
        // Check if user is admin, the booking owner, or the vendor of the hotel
        const isAdmin = req.user.role === 'admin';
        const isBookingOwner = booking.userId.toString() === req.user._id.toString();
        // Check if user is the vendor of this hotel
        let isHotelVendor = false;
        if (req.user.role === 'vendor') {
            // Find if this hotel belongs to the vendor
            const hotel = yield mongoose_1.default.model('Hotel').findOne({
                _id: booking.hotelId,
                vendorId: req.user._id
            });
            isHotelVendor = !!hotel;
        }
        if (!isAdmin && !isBookingOwner && !isHotelVendor) {
            return next(new appError_1.appError("Unauthorized access to this booking", 403));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Table booking retrieved successfully",
            data: booking,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getTableBookingById = getTableBookingById;
const updateTableBookingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        const { status, specialRequests } = req.body;
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
            return next(new appError_1.appError("Invalid booking ID", 400));
        }
        // Find the booking
        const booking = yield table_booking_model_1.TableBooking.findById(bookingId);
        if (!booking) {
            return next(new appError_1.appError("Booking not found", 404));
        }
        // Check if user is admin, the booking owner, or the vendor of the hotel
        const isAdmin = req.user.role === 'admin';
        const isBookingOwner = booking.userId.toString() === req.user._id.toString();
        // Check if user is the vendor of this hotel
        let isHotelVendor = false;
        if (req.user.role === 'vendor') {
            // Find if this hotel belongs to the vendor
            const hotel = yield mongoose_1.default.model('Hotel').findOne({
                _id: booking.hotelId,
                vendorId: req.user._id
            });
            isHotelVendor = !!hotel;
        }
        if (!isAdmin && !isBookingOwner && !isHotelVendor) {
            return next(new appError_1.appError("Unauthorized access to this booking", 403));
        }
        // Validate update data
        const validatedData = table_booking_validation_1.tableBookingUpdateValidation.parse({ status, specialRequests });
        // Update the booking
        const updatedBooking = yield table_booking_model_1.TableBooking.findByIdAndUpdate(bookingId, validatedData, { new: true }).populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status');
        res.json({
            success: true,
            statusCode: 200,
            message: "Table booking updated successfully",
            data: updatedBooking,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateTableBookingById = updateTableBookingById;
// For the cancelTableBooking function
const cancelTableBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
            return next(new appError_1.appError("Invalid booking ID", 400));
        }
        // Find the booking
        const booking = yield table_booking_model_1.TableBooking.findById(bookingId).populate('hotelId');
        if (!booking) {
            return next(new appError_1.appError("Booking not found", 404));
        }
        // Check if user is admin, the booking owner, or the vendor of the hotel
        const isAdmin = req.user.role === 'admin';
        const isBookingOwner = booking.userId.toString() === req.user._id.toString();
        // Check if user is the vendor of this hotel
        let isHotelVendor = false;
        if (req.user.role === 'vendor') {
            // Find if this hotel belongs to the vendor
            const hotel = yield mongoose_1.default.model('Hotel').findOne({
                _id: booking.hotelId,
                vendorId: req.user._id
            });
            isHotelVendor = !!hotel;
        }
        if (!isAdmin && !isBookingOwner && !isHotelVendor) {
            return next(new appError_1.appError("Unauthorized access to this booking", 403));
        }
        // Use a transaction to ensure both operations succeed or fail together
        const session = yield mongoose_1.default.startSession();
        try {
            yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                // Cancel the booking
                booking.status = 'Cancelled';
                yield booking.save({ session });
                // Update table status back to available when booking is cancelled
                if (booking.tableId) {
                    const updatedTable = yield mongoose_1.default.model('QRCode').findByIdAndUpdate(booking.tableId, { status: 'available' }, { new: true, session });
                    if (!updatedTable) {
                        throw new Error('Failed to update table status to available');
                    }
                }
            }));
        }
        catch (error) {
            console.error('Cancel booking transaction failed:', error);
            return next(new appError_1.appError("Failed to cancel booking and update table status", 500));
        }
        finally {
            yield session.endSession();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Table booking cancelled successfully",
            data: booking,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.cancelTableBooking = cancelTableBooking;
// Add these new controller methods to the existing file
const getAllTableBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Admin can see all bookings
        const bookings = yield table_booking_model_1.TableBooking.find()
            .populate('userId', 'name email phone')
            .populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: "All table bookings retrieved successfully",
            data: bookings,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTableBookings = getAllTableBookings;
const getVendorTableBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get vendor ID from authenticated user
        const vendorId = req.user._id;
        // Find hotels owned by this vendor
        const hotels = yield mongoose_1.default.model('Hotel').find({ vendorId });
        const hotelIds = hotels.map(hotel => hotel._id);
        // Get bookings for the vendor's hotels
        const bookings = yield table_booking_model_1.TableBooking.find({ hotelId: { $in: hotelIds } })
            .populate('userId', 'name email phone')
            .populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: "Vendor hotel table bookings retrieved successfully",
            data: bookings,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorTableBookings = getVendorTableBookings;
// Get filtered table bookings for reports (with pagination and filters)
const getFilteredTableBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, status, hotelId, paymentStatus, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = {};
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }
        // Status filter
        if (status) {
            filter.status = status;
        }
        // Hotel filter
        if (hotelId) {
            filter.hotelId = hotelId;
        }
        // Payment status filter
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        // Role-based access control
        if (req.user.role === 'vendor') {
            // Vendors can only see bookings for their hotels
            const hotels = yield mongoose_1.default.model('Hotel').find({ vendorId: req.user._id });
            const hotelIds = hotels.map(hotel => hotel._id);
            filter.hotelId = { $in: hotelIds };
        }
        // Admin can see all bookings (no additional filter needed)
        // Calculate pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Get total count for pagination
        const total = yield table_booking_model_1.TableBooking.countDocuments(filter);
        // Get filtered bookings
        const bookings = yield table_booking_model_1.TableBooking.find(filter)
            .populate('userId', 'name email phone')
            .populate('hotelId', 'name location mainImage')
            .populate('tableId', 'tableNumber seatNumber status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
        // Calculate pagination info
        const totalPages = Math.ceil(total / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.json({
            success: true,
            statusCode: 200,
            message: "Filtered table bookings retrieved successfully",
            data: {
                bookings,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getFilteredTableBookings = getFilteredTableBookings;
