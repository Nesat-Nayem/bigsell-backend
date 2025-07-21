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
exports.getAvailableTimeSlots = exports.updateHotelBookingSettings = exports.getHotelBookingSettings = exports.createHotelBookingSettings = void 0;
const hotel_booking_settings_model_1 = require("./hotel-booking-settings.model");
const hotel_booking_settings_validation_1 = require("./hotel-booking-settings.validation");
const appError_1 = require("../../errors/appError");
const mongoose_1 = __importDefault(require("mongoose"));
const createHotelBookingSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, baseBookingPrice, termsAndConditions, mealCategories, offers, advanceBookingDays, isActive } = req.body;
        // Check if settings already exist for this hotel
        const existingSettings = yield hotel_booking_settings_model_1.HotelBookingSettings.findOne({ hotelId });
        if (existingSettings) {
            return next(new appError_1.appError("Booking settings already exist for this hotel", 400));
        }
        // Validate the input
        const validatedData = hotel_booking_settings_validation_1.hotelBookingSettingsValidation.parse({
            hotelId,
            baseBookingPrice: Number(baseBookingPrice),
            termsAndConditions,
            mealCategories,
            offers,
            advanceBookingDays: Number(advanceBookingDays),
            isActive
        });
        // Create new settings
        const bookingSettings = new hotel_booking_settings_model_1.HotelBookingSettings(validatedData);
        yield bookingSettings.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Hotel booking settings created successfully",
            data: bookingSettings,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createHotelBookingSettings = createHotelBookingSettings;
const getHotelBookingSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelId = req.params.hotelId;
        console.log("hotel id", hotelId);
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(hotelId)) {
            return next(new appError_1.appError("Invalid hotel ID", 400));
        }
        // Get settings for the hotel
        const settings = yield hotel_booking_settings_model_1.HotelBookingSettings.findOne({ hotelId });
        if (!settings) {
            // If no custom settings, return default settings
            const defaultSettings = new hotel_booking_settings_model_1.HotelBookingSettings({ hotelId });
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
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelBookingSettings = getHotelBookingSettings;
const updateHotelBookingSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelId = req.params.hotelId;
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(hotelId)) {
            return next(new appError_1.appError("Invalid hotel ID", 400));
        }
        // Check if settings exist
        let settings = yield hotel_booking_settings_model_1.HotelBookingSettings.findOne({ hotelId });
        if (!settings) {
            // Create new settings if they don't exist
            settings = new hotel_booking_settings_model_1.HotelBookingSettings(Object.assign({ hotelId }, req.body));
            yield settings.save();
            res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Hotel booking settings created successfully",
                data: settings,
            });
            return;
        }
        // Validate update data
        const validatedData = hotel_booking_settings_validation_1.hotelBookingSettingsUpdateValidation.parse(req.body);
        // Update settings
        const updatedSettings = yield hotel_booking_settings_model_1.HotelBookingSettings.findOneAndUpdate({ hotelId }, validatedData, { new: true });
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel booking settings updated successfully",
            data: updatedSettings,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateHotelBookingSettings = updateHotelBookingSettings;
const getAvailableTimeSlots = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, date, mealType } = req.query;
        console.log("hotelId on available slot", hotelId);
        // Validate required parameters
        if (!hotelId || !date) {
            return next(new appError_1.appError("Hotel ID and date are required", 400));
        }
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(hotelId)) {
            return next(new appError_1.appError("Invalid hotel ID", 400));
        }
        // Get settings for the hotel
        const settings = yield hotel_booking_settings_model_1.HotelBookingSettings.findOne({ hotelId });
        if (!settings) {
            return next(new appError_1.appError("Booking settings not found for this hotel", 404));
        }
        // Find the requested meal category
        let mealCategory = settings.mealCategories.find(cat => cat.name.toLowerCase() === (mealType === null || mealType === void 0 ? void 0 : mealType.toLowerCase()));
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
        const bookings = yield mongoose_1.default.model('TableBooking').find({
            hotelId,
            date: new Date(date),
            mealType: mealCategory.name
        });
        // Calculate availability for each time slot
        const timeSlots = mealCategory.timeSlots.map(slot => {
            const bookingsForSlot = bookings.filter(booking => booking.time === slot.time);
            const remainingCapacity = Math.max(0, slot.maxCapacity - bookingsForSlot.length);
            // Find applicable offers for this time slot
            const applicableOffers = settings.offers.filter(offer => {
                const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                return offer.applicableTimeSlots.includes(slot.time) &&
                    offer.applicableDays.includes(day);
            });
            return Object.assign(Object.assign({}, slot.toObject()), { remainingCapacity, isAvailable: slot.isAvailable && remainingCapacity > 0, offers: applicableOffers });
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAvailableTimeSlots = getAvailableTimeSlots;
