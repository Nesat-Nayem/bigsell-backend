import { Request, Response, NextFunction } from 'express';
import { Order } from '../order/order.model';
import { TableBooking } from '../table-booking/table-booking.model';
import { Hotel } from '../hotel/hotel.model';
import { User } from '../auth/auth.model';
import { appError } from '../../errors/appError';
import { userInterface } from '../../middlewares/userInterface';
import * as ExcelJS from 'exceljs';

interface ReportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
    hotelId?: string;
    paymentStatus?: string;
    search?: string;
    orderId?: string;
    bookingId?: string;
    customerPhone?: string;
    minAmount?: string;
    maxAmount?: string;
    page?: string;
    limit?: string;
}

// Get dashboard statistics
export const getReportStats = async (req: userInterface, res: Response, next: NextFunction) => {
    try {
    const filters: ReportFilters = req.query;
    
    // Build date filter
    const dateFilter: any = {};
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
    const orderFilters: any = { ...dateFilter };
    if (filters.status) {
        orderFilters.status = filters.status;
    }
    if (filters.paymentStatus) {
        orderFilters.paymentStatus = filters.paymentStatus;
    }

    // Build additional filters for bookings
    const bookingFilters: any = { ...dateFilter };
    if (filters.status) {
        bookingFilters.status = filters.status;
    }
    if (filters.paymentStatus) {
        bookingFilters.paymentStatus = filters.paymentStatus;
    }

    // Get statistics
    const [
        totalOrders,
        totalBookings,
        orderRevenue,
        bookingRevenue,
        pendingOrders,
        completedBookings,
        todayOrders,
        todayBookings
    ] = await Promise.all([
        // Total orders
        Order.countDocuments(orderFilters),
        
        // Total bookings
        TableBooking.countDocuments(bookingFilters),
        
        // Order revenue
        Order.aggregate([
            { $match: orderFilters },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),
        
        // Booking revenue
        TableBooking.aggregate([
            { $match: bookingFilters },
            { $group: { _id: null, total: { $sum: '$bookingPrice' } } }
        ]).then(result => result[0]?.total || 0),
        
        // Pending orders
        Order.countDocuments({ ...orderFilters, status: 'pending' }),
        
        // Completed bookings
        TableBooking.countDocuments({ ...bookingFilters, status: 'Completed' }),
        
        // Today's orders
        Order.countDocuments({
            ...orderFilters,
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
        }),
        
        // Today's bookings
        TableBooking.countDocuments({
            ...bookingFilters,
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
        })
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
    } catch (error) {
        next(new appError('Failed to get report statistics', 500));
    }
};

// Export orders report
export const exportOrdersReport = async (req: userInterface, res: Response, next: NextFunction) => {
    try {
    const filters: ReportFilters = req.query;
    
    // Build filters
    const orderFilters: any = {};
    
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
    const orders = await Order.find(orderFilters)
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
    orders.forEach((order: any) => {
        const customerNames = order.users?.map((user: any) => user.name || user.phone).join(', ') || 'N/A';
        
        worksheet.addRow({
            orderId: order._id.toString().slice(-6),
            date: new Date(order.createdAt).toLocaleDateString('en-IN'),
            customer: customerNames,
            itemsCount: order.items?.length || 0,
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
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    } catch (error) {
        next(new appError('Failed to export orders report', 500));
    }
};

// Export bookings report
export const exportBookingsReport = async (req: userInterface, res: Response, next: NextFunction) => {
    try {
    const filters: ReportFilters = req.query;
    
    // Build filters
    const bookingFilters: any = {};
    
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
    const bookings = await TableBooking.find(bookingFilters)
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
    bookings.forEach((booking: any) => {
        worksheet.addRow({
            bookingId: booking._id.toString().slice(-6),
            dateCreated: new Date(booking.createdAt).toLocaleDateString('en-IN'),
            customer: booking.userId?.name || booking.userId?.phone || 'N/A',
            hotel: booking.hotelId?.name || 'N/A',
            location: booking.hotelId?.location || 'N/A',
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
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    } catch (error) {
        next(new appError('Failed to export bookings report', 500));
    }
};

// Get filtered orders
export const getFilteredOrders = async (req: userInterface, res: Response, next: NextFunction) => {
    try {
        console.log('Getting filtered orders with filters:', req.query);
        const filters: ReportFilters = req.query;
        const page = parseInt(filters.page || '1');
        const limit = parseInt(filters.limit || '10');
        const skip = (page - 1) * limit;

        // Build date filter
        const dateFilter: any = {};
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
        const orderFilters: any = { ...dateFilter };
        
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
                
                const matchingOrders = await Order.aggregate(pipeline);
                const matchingIds = matchingOrders.map(order => order._id);
                
                if (matchingIds.length > 0) {
                    orderFilters._id = { $in: matchingIds };
                } else {
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
            } catch (error) {
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
        let userIds: any[] = [];
        if (filters.search || filters.customerPhone) {
            const searchTerm = filters.search || filters.customerPhone;
            const users = await User.find({
                $or: [
                    { phone: { $regex: searchTerm, $options: 'i' } },
                    { name: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');
            userIds = users.map((user: any) => user._id);
            
            if (userIds.length > 0) {
                orderFilters.users = { $in: userIds };
            } else {
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
        const [orders, total] = await Promise.all([
            Order.find(orderFilters)
                .populate('users', 'name phone')
                .populate('items.hotelId', 'name location')
                .populate('items.menuItem')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(orderFilters)
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
    } catch (error) {
        console.error('Error in getFilteredOrders:', error);
        next(new appError('Failed to get filtered orders', 500));
    }
};

// Get filtered table bookings
export const getFilteredBookings = async (req: userInterface, res: Response, next: NextFunction) => {
    try {
        const filters: ReportFilters = req.query;
        const page = parseInt(filters.page || '1');
        const limit = parseInt(filters.limit || '10');
        const skip = (page - 1) * limit;

        // Build date filter
        const dateFilter: any = {};
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
        const bookingFilters: any = { ...dateFilter };
        
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
                
                const matchingBookings = await TableBooking.aggregate(pipeline);
                const matchingIds = matchingBookings.map(booking => booking._id);
                
                if (matchingIds.length > 0) {
                    bookingFilters._id = { $in: matchingIds };
                } else {
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
            } catch (error) {
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
            const users = await User.find({
                $or: [
                    { phone: { $regex: searchTerm, $options: 'i' } },
                    { name: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map((user: any) => user._id);
            
            if (userIds.length > 0) {
                bookingFilters.userId = { $in: userIds };
            } else {
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
        const [bookings, total] = await Promise.all([
            TableBooking.find(bookingFilters)
                .populate('userId', 'name phone')
                .populate('hotelId', 'name location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TableBooking.countDocuments(bookingFilters)
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
    } catch (error) {
        next(new appError('Failed to get filtered bookings', 500));
    }
};
