import { NextFunction, Request, Response } from "express";
import { TableBooking } from "./table-booking.model";
import { tableBookingValidation, tableBookingUpdateValidation } from "./table-booking.validation";
import { appError } from "../../errors/appError";
import mongoose from "mongoose";
import { userInterface } from "../../middlewares/userInterface";


export const createTableBooking = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      hotelId, 
      tableId, 
      tableNumber, 
      seatNumber, 
      guestCount, 
      date, 
      time, 
      mealType, 
      offerApplied, 
      offerDiscount, 
      coverCharge, 
      bookingPrice, 
      paymentStatus, 
      specialRequests 
    } = req.body;
    
    // Get user ID from authenticated user
    const userId = req.user._id;
    
    // Get hotel booking settings (use provided bookingPrice or fallback to settings/default)
    const bookingSettings = await mongoose.model('HotelBookingSettings').findOne({ hotelId });
    const finalBookingPrice = bookingPrice || bookingSettings?.baseBookingPrice || 300;
    
    // Validate the input
    const validatedData = tableBookingValidation.parse({ 
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
    const table = await mongoose.model('QRCode').findById(tableId);
    if (!table) {
      return next(new appError("Table not found", 404));
    }
    
    if (table.status === 'booked') {
      return next(new appError("Table is already booked", 400));
    }

    // Use a transaction to ensure both operations succeed or fail together
    const session = await mongoose.startSession();
    let tableBooking;
    
    try {
      await session.withTransaction(async () => {
        // Create a new table booking
        tableBooking = new TableBooking({
          userId,
          ...validatedData,
          date: new Date(validatedData.date)
        });
        
        await tableBooking.save({ session });

        // Update table status to booked
        const updatedTable = await mongoose.model('QRCode').findByIdAndUpdate(
          tableId,
          { status: 'booked' },
          { new: true, session }
        );

        if (!updatedTable) {
          throw new Error('Failed to update table status');
        }
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      return next(new appError("Failed to create booking and update table status", 500));
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Table booking created successfully",
      data: tableBooking,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getUserTableBookings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user._id;
    
    // Get bookings for the user
    const bookings = await TableBooking.find({ userId })
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
  } catch (error) {
    next(error);
  }
};

export const getTableBookingById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(new appError("Invalid booking ID", 400));
    }
    
    // Get the booking
    const booking = await TableBooking.findById(bookingId)
      .populate('hotelId', 'name location mainImage')
      .populate('tableId', 'tableNumber seatNumber status');
    
    if (!booking) {
      return next(new appError("Booking not found", 404));
    }
    
    
    // Check if user is admin, the booking owner, or the vendor of the hotel
    const isAdmin = req.user.role === 'admin';
    const isBookingOwner = booking.userId.toString() === req.user._id.toString();
    
    // Check if user is the vendor of this hotel
    let isHotelVendor = false;
    if (req.user.role === 'vendor') {
      // Find if this hotel belongs to the vendor
      const hotel = await mongoose.model('Hotel').findOne({
        _id: booking.hotelId,
        vendorId: req.user._id
      });
      
      isHotelVendor = !!hotel;
    }
    
    if (!isAdmin && !isBookingOwner && !isHotelVendor) {
      return next(new appError("Unauthorized access to this booking", 403));
    }
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Table booking retrieved successfully",
      data: booking,
    });
    return;
  } catch (error) {
    next(error);
  }
};


export const updateTableBookingById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.id;
    const { status, specialRequests } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(new appError("Invalid booking ID", 400));
    }
    
    // Find the booking
    const booking = await TableBooking.findById(bookingId);
    
    if (!booking) {
      return next(new appError("Booking not found", 404));
    }
    
    // Check if user is admin, the booking owner, or the vendor of the hotel
    const isAdmin = req.user.role === 'admin';
    const isBookingOwner = booking.userId.toString() === req.user._id.toString();
    
    // Check if user is the vendor of this hotel
    let isHotelVendor = false;
    if (req.user.role === 'vendor') {
      // Find if this hotel belongs to the vendor
      const hotel = await mongoose.model('Hotel').findOne({
        _id: booking.hotelId,
        vendorId: req.user._id
      });
      
      isHotelVendor = !!hotel;
    }
    
    if (!isAdmin && !isBookingOwner && !isHotelVendor) {
      return next(new appError("Unauthorized access to this booking", 403));
    }
    
    // Validate update data
    const validatedData = tableBookingUpdateValidation.parse({ status, specialRequests });
    
    // Update the booking
    const updatedBooking = await TableBooking.findByIdAndUpdate(
      bookingId,
      validatedData,
      { new: true }
    ).populate('hotelId', 'name location mainImage')
    .populate('tableId', 'tableNumber seatNumber status');
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Table booking updated successfully",
      data: updatedBooking,
    });
    return;
  } catch (error) {
    next(error);
  }
};


// For the cancelTableBooking function
export const cancelTableBooking = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(new appError("Invalid booking ID", 400));
    }
    
    // Find the booking
    const booking = await TableBooking.findById(bookingId).populate('hotelId');
    
    if (!booking) {
      return next(new appError("Booking not found", 404));
    }
    
    // Check if user is admin, the booking owner, or the vendor of the hotel
    const isAdmin = req.user.role === 'admin';
    const isBookingOwner = booking.userId.toString() === req.user._id.toString();
    
    // Check if user is the vendor of this hotel
    let isHotelVendor = false;
    if (req.user.role === 'vendor') {
      // Find if this hotel belongs to the vendor
      const hotel = await mongoose.model('Hotel').findOne({
        _id: booking.hotelId,
        vendorId: req.user._id
      });
      
      isHotelVendor = !!hotel;
    }
    
    if (!isAdmin && !isBookingOwner && !isHotelVendor) {
      return next(new appError("Unauthorized access to this booking", 403));
    }
    
    // Use a transaction to ensure both operations succeed or fail together
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Cancel the booking
        booking.status = 'Cancelled';
        await booking.save({ session });

        // Update table status back to available when booking is cancelled
        if (booking.tableId) {
          const updatedTable = await mongoose.model('QRCode').findByIdAndUpdate(
            booking.tableId,
            { status: 'available' },
            { new: true, session }
          );

          if (!updatedTable) {
            throw new Error('Failed to update table status to available');
          }
        }
      });
    } catch (error) {
      console.error('Cancel booking transaction failed:', error);
      return next(new appError("Failed to cancel booking and update table status", 500));
    } finally {
      await session.endSession();
    }
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Table booking cancelled successfully",
      data: booking,
    });
    return;
  } catch (error) {
    next(error);
  }
};


// Add these new controller methods to the existing file

export const getAllTableBookings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Admin can see all bookings
    const bookings = await TableBooking.find()
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
  } catch (error) {
    next(error);
  }
};

export const getVendorTableBookings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get vendor ID from authenticated user
    const vendorId = req.user._id;
    
    // Find hotels owned by this vendor
    const hotels = await mongoose.model('Hotel').find({ vendorId });
    const hotelIds = hotels.map(hotel => hotel._id);
    
    // Get bookings for the vendor's hotels
    const bookings = await TableBooking.find({ hotelId: { $in: hotelIds } })
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
  } catch (error) {
    next(error);
  }
};

// Get filtered table bookings for reports (with pagination and filters)
export const getFilteredTableBookings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      hotelId, 
      paymentStatus, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
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
      const hotels = await mongoose.model('Hotel').find({ vendorId: req.user._id });
      const hotelIds = hotels.map(hotel => hotel._id);
      filter.hotelId = { $in: hotelIds };
    }
    // Admin can see all bookings (no additional filter needed)

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await TableBooking.countDocuments(filter);

    // Get filtered bookings
    const bookings = await TableBooking.find(filter)
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
  } catch (error) {
    next(error);
  }
};
