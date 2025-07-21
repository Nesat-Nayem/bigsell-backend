import { NextFunction, Response } from "express";
import { HotelBookingSettings } from "./hotel-booking-settings.model";
import { hotelBookingSettingsValidation, hotelBookingSettingsUpdateValidation } from "./hotel-booking-settings.validation";
import { appError } from "../../errors/appError";
import mongoose from "mongoose";
import { userInterface } from "../../middlewares/userInterface";

export const createHotelBookingSettings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId, baseBookingPrice, termsAndConditions, mealCategories, offers, advanceBookingDays, isActive } = req.body;
    
    // Check if settings already exist for this hotel
    const existingSettings = await HotelBookingSettings.findOne({ hotelId });
    if (existingSettings) {
      return next(new appError("Booking settings already exist for this hotel", 400));
    }
    
    // Validate the input
    const validatedData = hotelBookingSettingsValidation.parse({ 
      hotelId, 
      baseBookingPrice: Number(baseBookingPrice), 
      termsAndConditions, 
      mealCategories,
      offers,
      advanceBookingDays: Number(advanceBookingDays),
      isActive
    });

    // Create new settings
    const bookingSettings = new HotelBookingSettings(validatedData);
    await bookingSettings.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Hotel booking settings created successfully",
      data: bookingSettings,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getHotelBookingSettings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;

    console.log("hotel id", hotelId)
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return next(new appError("Invalid hotel ID", 400));
    }
    
    // Get settings for the hotel
    const settings = await HotelBookingSettings.findOne({ hotelId });
    
    if (!settings) {
      // If no custom settings, return default settings
      const defaultSettings = new HotelBookingSettings({ hotelId });
      
      res.json({
        success: true,
        statusCode: 200,
        message: "Default hotel booking settings retrieved",
        data: defaultSettings,
      });
      return;
    }
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Hotel booking settings retrieved successfully",
      data: settings,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateHotelBookingSettings = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return next(new appError("Invalid hotel ID", 400));
    }
    
    // Check if settings exist
    let settings = await HotelBookingSettings.findOne({ hotelId });
    
    if (!settings) {
      // Create new settings if they don't exist
      settings = new HotelBookingSettings({ hotelId, ...req.body });
      await settings.save();
      
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "Hotel booking settings created successfully",
        data: settings,
      });
      return;
    }
    
    // Validate update data
    const validatedData = hotelBookingSettingsUpdateValidation.parse(req.body);
    
    // Update settings
    const updatedSettings = await HotelBookingSettings.findOneAndUpdate(
      { hotelId },
      validatedData,
      { new: true }
    );
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Hotel booking settings updated successfully",
      data: updatedSettings,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAvailableTimeSlots = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId, date, mealType } = req.query;

    console.log("hotelId on available slot", hotelId)
    
    // Validate required parameters
    if (!hotelId || !date) {
      return next(new appError("Hotel ID and date are required", 400));
    }
    
  
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId as string)) {
      return next(new appError("Invalid hotel ID", 400));
    }
    
    // Get settings for the hotel
    const settings = await HotelBookingSettings.findOne({ hotelId });
    
    if (!settings) {
      return next(new appError("Booking settings not found for this hotel", 404));
    }
    
    // Find the requested meal category
    let mealCategory = settings.mealCategories.find(cat => 
      cat.name.toLowerCase() === (mealType as string)?.toLowerCase()
    );
    
    // If no specific meal type requested or not found, return all meal categories
    if (!mealType || !mealCategory) {
      res.json({
        success: true,
        statusCode: 200,
        message: "Available meal categories and time slots retrieved",
        data: settings.mealCategories,
      });
      return;
    }
    
    // Get existing bookings for the date and hotel
    const bookings = await mongoose.model('TableBooking').find({
      hotelId,
      date: new Date(date as string),
      mealType: mealCategory.name
    });
    
    // Calculate availability for each time slot
    const timeSlots = mealCategory.timeSlots.map(slot => {
      const bookingsForSlot = bookings.filter(booking => booking.time === slot.time);
      const remainingCapacity = Math.max(0, slot.maxCapacity - bookingsForSlot.length);
      
      // Find applicable offers for this time slot
      const applicableOffers = settings.offers.filter(offer => {
        const day = new Date(date as string).toLocaleDateString('en-US', { weekday: 'long' });
        return offer.applicableTimeSlots.includes(slot.time) && 
               offer.applicableDays.includes(day);
      });
      
      return {
        ...(slot as any).toObject(),
        remainingCapacity,
        isAvailable: slot.isAvailable && remainingCapacity > 0,
        offers: applicableOffers
      };
    });
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Available time slots retrieved successfully",
      data: {
        mealType: mealCategory.name,
        description: mealCategory.description,
        timeSlots
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};