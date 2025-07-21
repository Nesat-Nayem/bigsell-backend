"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getFilteredBookings = exports.getFilteredOrders = exports.exportBookingsReport = exports.exportOrdersReport = exports.getReportStats = void 0;
const order_model_1 = require("../order/order.model");
const table_booking_model_1 = require("../table-booking/table-booking.model");
const auth_model_1 = require("../auth/auth.model");
const appError_1 = require("../../errors/appError");
const ExcelJS = __importStar(require("exceljs"));
// Get dashboard statistics
const getReportStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        // Build date filter
        const dateFilter = {};
        if (filters.startDate || filters.endDate) {
            dateFilter.createdAt = {};
            if (filters.startDate) {
                dateFilter.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.createdAt.$lte = new Date(filters.endDate);
            }
        }
        // Build additional filters for orders
        const orderFilters = Object.assign({}, dateFilter);
        if (filters.status) {
            orderFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            orderFilters.paymentStatus = filters.paymentStatus;
        }
        // Build additional filters for bookings
        const bookingFilters = Object.assign({}, dateFilter);
        if (filters.status) {
            bookingFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            bookingFilters.paymentStatus = filters.paymentStatus;
        }
        // Get statistics
        const [totalOrders, totalBookings, orderRevenue, bookingRevenue, pendingOrders, completedBookings, todayOrders, todayBookings] = yield Promise.all([
            // Total orders
            order_model_1.Order.countDocuments(orderFilters),
            // Total bookings
            table_booking_model_1.TableBooking.countDocuments(bookingFilters),
            // Order revenue
            order_model_1.Order.aggregate([
                { $match: orderFilters },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then(result => { var _a; return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0; }),
            // Booking revenue
            table_booking_model_1.TableBooking.aggregate([
                { $match: bookingFilters },
                { $group: { _id: null, total: { $sum: '$bookingPrice' } } }
            ]).then(result => { var _a; return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0; }),
            // Pending orders
            order_model_1.Order.countDocuments(Object.assign(Object.assign({}, orderFilters), { status: 'pending' })),
            // Completed bookings
            table_booking_model_1.TableBooking.countDocuments(Object.assign(Object.assign({}, bookingFilters), { status: 'Completed' })),
            // Today's orders
            order_model_1.Order.countDocuments(Object.assign(Object.assign({}, orderFilters), { createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59, 999))
                } })),
            // Today's bookings
            table_booking_model_1.TableBooking.countDocuments(Object.assign(Object.assign({}, bookingFilters), { createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59, 999))
                } }))
        ]);
        const totalRevenue = orderRevenue + bookingRevenue;
        const stats = {
            totalOrders,
            totalBookings,
            totalRevenue,
            totalOrderRevenue: orderRevenue,
            totalBookingRevenue: bookingRevenue,
            pendingOrders,
            completedBookings,
            todayOrders,
            todayBookings
        };
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Report statistics retrieved successfully',
            data: stats
        });
    }
    catch (error) {
        next(new appError_1.appError('Failed to get report statistics', 500));
    }
});
exports.getReportStats = getReportStats;
// Export orders report
const exportOrdersReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        // Build filters
        const orderFilters = {};
        if (filters.startDate || filters.endDate) {
            orderFilters.createdAt = {};
            if (filters.startDate) {
                orderFilters.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                orderFilters.createdAt.$lte = new Date(filters.endDate);
            }
        }
        if (filters.status) {
            orderFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            orderFilters.paymentStatus = filters.paymentStatus;
        }
        // Get orders with populated data
        const orders = yield order_model_1.Order.find(orderFilters)
            .populate('users', 'name phone')
            .sort({ createdAt: -1 })
            .lean();
        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders Report');
        // Add headers
        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 15 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Items Count', key: 'itemsCount', width: 15 },
            { header: 'Subtotal', key: 'subtotal', width: 15 },
            { header: 'CGST', key: 'cgst', width: 10 },
            { header: 'SGST', key: 'sgst', width: 10 },
            { header: 'Service Charge', key: 'serviceCharge', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Amount Paid', key: 'amountPaid', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 },
            { header: 'Order Status', key: 'orderStatus', width: 15 },
            { header: 'Table Number', key: 'tableNumber', width: 15 },
            { header: 'Coupon Code', key: 'couponCode', width: 15 },
        ];
        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };
        // Add data rows
        orders.forEach((order) => {
            var _a, _b;
            const customerNames = ((_a = order.users) === null || _a === void 0 ? void 0 : _a.map((user) => user.name || user.phone).join(', ')) || 'N/A';
            worksheet.addRow({
                orderId: order._id.toString().slice(-6),
                date: new Date(order.createdAt).toLocaleDateString('en-IN'),
                customer: customerNames,
                itemsCount: ((_b = order.items) === null || _b === void 0 ? void 0 : _b.length) || 0,
                subtotal: order.subtotal || 0,
                cgst: order.cgstAmount || 0,
                sgst: order.sgstAmount || 0,
                serviceCharge: order.serviceCharge || 0,
                totalAmount: order.totalAmount || 0,
                discount: order.discountAmount || 0,
                amountPaid: order.amountPaid || 0,
                paymentMethod: order.paymentMethod || 'N/A',
                paymentStatus: order.paymentStatus || 'N/A',
                orderStatus: order.status || 'N/A',
                tableNumber: order.tableNumber || 'N/A',
                couponCode: order.couponCode || 'N/A',
            });
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=orders-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(new appError_1.appError('Failed to export orders report', 500));
    }
});
exports.exportOrdersReport = exportOrdersReport;
// Export bookings report
const exportBookingsReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        // Build filters
        const bookingFilters = {};
        if (filters.startDate || filters.endDate) {
            bookingFilters.createdAt = {};
            if (filters.startDate) {
                bookingFilters.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                bookingFilters.createdAt.$lte = new Date(filters.endDate);
            }
        }
        if (filters.status) {
            bookingFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            bookingFilters.paymentStatus = filters.paymentStatus;
        }
        // Get bookings with populated data
        const bookings = yield table_booking_model_1.TableBooking.find(bookingFilters)
            .populate('userId', 'name phone')
            .populate('hotelId', 'name location')
            .sort({ createdAt: -1 })
            .lean();
        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bookings Report');
        // Add headers
        worksheet.columns = [
            { header: 'Booking ID', key: 'bookingId', width: 15 },
            { header: 'Date Created', key: 'dateCreated', width: 20 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Hotel', key: 'hotel', width: 25 },
            { header: 'Location', key: 'location', width: 25 },
            { header: 'Booking Date', key: 'bookingDate', width: 15 },
            { header: 'Booking Time', key: 'bookingTime', width: 15 },
            { header: 'Guest Count', key: 'guestCount', width: 15 },
            { header: 'Meal Type', key: 'mealType', width: 15 },
            { header: 'Booking Price', key: 'bookingPrice', width: 15 },
            { header: 'Cover Charge', key: 'coverCharge', width: 15 },
            { header: 'Offer Applied', key: 'offerApplied', width: 20 },
            { header: 'Offer Discount', key: 'offerDiscount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 },
            { header: 'Special Requests', key: 'specialRequests', width: 30 },
        ];
        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };
        // Add data rows
        bookings.forEach((booking) => {
            var _a, _b, _c, _d;
            worksheet.addRow({
                bookingId: booking._id.toString().slice(-6),
                dateCreated: new Date(booking.createdAt).toLocaleDateString('en-IN'),
                customer: ((_a = booking.userId) === null || _a === void 0 ? void 0 : _a.name) || ((_b = booking.userId) === null || _b === void 0 ? void 0 : _b.phone) || 'N/A',
                hotel: ((_c = booking.hotelId) === null || _c === void 0 ? void 0 : _c.name) || 'N/A',
                location: ((_d = booking.hotelId) === null || _d === void 0 ? void 0 : _d.location) || 'N/A',
                bookingDate: new Date(booking.date).toLocaleDateString('en-IN'),
                bookingTime: booking.time || 'N/A',
                guestCount: booking.guestCount || 0,
                mealType: booking.mealType || 'N/A',
                bookingPrice: booking.bookingPrice || 0,
                coverCharge: booking.coverCharge || 0,
                offerApplied: booking.offerApplied || 'N/A',
                offerDiscount: booking.offerDiscount || 'N/A',
                status: booking.status || 'N/A',
                paymentStatus: booking.paymentStatus || 'N/A',
                specialRequests: booking.specialRequests || 'N/A',
            });
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(new appError_1.appError('Failed to export bookings report', 500));
    }
});
exports.exportBookingsReport = exportBookingsReport;
// Get filtered orders
const getFilteredOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Getting filtered orders with filters:', req.query);
        const filters = req.query;
        const page = parseInt(filters.page || '1');
        const limit = parseInt(filters.limit || '10');
        const skip = (page - 1) * limit;
        // Build date filter
        const dateFilter = {};
        if (filters.startDate || filters.endDate) {
            dateFilter.createdAt = {};
            if (filters.startDate) {
                dateFilter.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.createdAt.$lte = new Date(filters.endDate);
            }
        }
        // Build order filters
        const orderFilters = Object.assign({}, dateFilter);
        if (filters.status) {
            orderFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            orderFilters.paymentStatus = filters.paymentStatus;
        }
        if (filters.hotelId) {
            orderFilters['items.hotelId'] = filters.hotelId;
        }
        // Search by Order ID
        if (filters.orderId) {
            try {
                // Convert ObjectId to string and search using aggregation
                // This approach searches in the stringified version of the ObjectId
                const pipeline = [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" }
                        }
                    },
                    {
                        $match: {
                            idString: { $regex: filters.orderId, $options: 'i' }
                        }
                    },
                    {
                        $project: { _id: 1 }
                    }
                ];
                const matchingOrders = yield order_model_1.Order.aggregate(pipeline);
                const matchingIds = matchingOrders.map(order => order._id);
                if (matchingIds.length > 0) {
                    orderFilters._id = { $in: matchingIds };
                }
                else {
                    // If no matching IDs found, return empty result
                    res.status(200).json({
                        success: true,
                        statusCode: 200,
                        message: 'Orders retrieved successfully',
                        data: {
                            orders: [],
                            total: 0,
                            page,
                            limit,
                            totalPages: 0
                        }
                    });
                    return;
                }
            }
            catch (error) {
                console.error('Error searching order IDs:', error);
                // If there's an error, return empty result
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'Orders retrieved successfully',
                    data: {
                        orders: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                });
                return;
            }
        }
        // Amount range filter
        if (filters.minAmount || filters.maxAmount) {
            orderFilters.totalAmount = {};
            if (filters.minAmount) {
                orderFilters.totalAmount.$gte = parseFloat(filters.minAmount);
            }
            if (filters.maxAmount) {
                orderFilters.totalAmount.$lte = parseFloat(filters.maxAmount);
            }
        }
        // General search (customer phone or name)
        let userIds = [];
        if (filters.search || filters.customerPhone) {
            const searchTerm = filters.search || filters.customerPhone;
            const users = yield auth_model_1.User.find({
                $or: [
                    { phone: { $regex: searchTerm, $options: 'i' } },
                    { name: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');
            userIds = users.map((user) => user._id);
            if (userIds.length > 0) {
                orderFilters.users = { $in: userIds };
            }
            else {
                // If no users found, return empty result
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'Orders retrieved successfully',
                    data: {
                        orders: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                });
                return;
            }
        }
        // Get orders with pagination
        console.log('Final order filters:', orderFilters);
        const [orders, total] = yield Promise.all([
            order_model_1.Order.find(orderFilters)
                .populate('users', 'name phone')
                .populate('items.hotelId', 'name location')
                .populate('items.menuItem')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            order_model_1.Order.countDocuments(orderFilters)
        ]);
        console.log(`Found ${total} orders, returning ${orders.length} orders`);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Orders retrieved successfully',
            data: {
                orders,
                total,
                page,
                limit,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Error in getFilteredOrders:', error);
        next(new appError_1.appError('Failed to get filtered orders', 500));
    }
});
exports.getFilteredOrders = getFilteredOrders;
// Get filtered table bookings
const getFilteredBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        const page = parseInt(filters.page || '1');
        const limit = parseInt(filters.limit || '10');
        const skip = (page - 1) * limit;
        // Build date filter
        const dateFilter = {};
        if (filters.startDate || filters.endDate) {
            dateFilter.createdAt = {};
            if (filters.startDate) {
                dateFilter.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.createdAt.$lte = new Date(filters.endDate);
            }
        }
        // Build booking filters
        const bookingFilters = Object.assign({}, dateFilter);
        if (filters.status) {
            bookingFilters.status = filters.status;
        }
        if (filters.paymentStatus) {
            bookingFilters.paymentStatus = filters.paymentStatus;
        }
        if (filters.hotelId) {
            bookingFilters.hotelId = filters.hotelId;
        }
        // Search by Booking ID
        if (filters.bookingId) {
            try {
                // Convert ObjectId to string and search using aggregation
                // This approach searches in the stringified version of the ObjectId
                const pipeline = [
                    {
                        $addFields: {
                            idString: { $toString: "$_id" }
                        }
                    },
                    {
                        $match: {
                            idString: { $regex: filters.bookingId, $options: 'i' }
                        }
                    },
                    {
                        $project: { _id: 1 }
                    }
                ];
                const matchingBookings = yield table_booking_model_1.TableBooking.aggregate(pipeline);
                const matchingIds = matchingBookings.map(booking => booking._id);
                if (matchingIds.length > 0) {
                    bookingFilters._id = { $in: matchingIds };
                }
                else {
                    // If no matching IDs found, return empty result
                    res.status(200).json({
                        success: true,
                        statusCode: 200,
                        message: 'Bookings retrieved successfully',
                        data: {
                            bookings: [],
                            total: 0,
                            page,
                            limit,
                            totalPages: 0
                        }
                    });
                    return;
                }
            }
            catch (error) {
                console.error('Error searching booking IDs:', error);
                // If there's an error, return empty result
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'Bookings retrieved successfully',
                    data: {
                        bookings: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                });
                return;
            }
        }
        // Amount range filter
        if (filters.minAmount || filters.maxAmount) {
            bookingFilters.bookingPrice = {};
            if (filters.minAmount) {
                bookingFilters.bookingPrice.$gte = parseFloat(filters.minAmount);
            }
            if (filters.maxAmount) {
                bookingFilters.bookingPrice.$lte = parseFloat(filters.maxAmount);
            }
        }
        // General search (customer phone or name)
        if (filters.search || filters.customerPhone) {
            const searchTerm = filters.search || filters.customerPhone;
            const users = yield auth_model_1.User.find({
                $or: [
                    { phone: { $regex: searchTerm, $options: 'i' } },
                    { name: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map((user) => user._id);
            if (userIds.length > 0) {
                bookingFilters.userId = { $in: userIds };
            }
            else {
                // If no users found, return empty result
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'Bookings retrieved successfully',
                    data: {
                        bookings: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                });
                return;
            }
        }
        // Get bookings with pagination
        const [bookings, total] = yield Promise.all([
            table_booking_model_1.TableBooking.find(bookingFilters)
                .populate('userId', 'name phone')
                .populate('hotelId', 'name location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            table_booking_model_1.TableBooking.countDocuments(bookingFilters)
        ]);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Bookings retrieved successfully',
            data: {
                bookings,
                total,
                page,
                limit,
                totalPages
            }
        });
    }
    catch (error) {
        next(new appError_1.appError('Failed to get filtered bookings', 500));
    }
});
exports.getFilteredBookings = getFilteredBookings;
