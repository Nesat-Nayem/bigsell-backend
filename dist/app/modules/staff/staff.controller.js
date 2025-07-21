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
exports.getStaffHotelMenu = exports.deleteStaff = exports.updateStaff = exports.getStaffById = exports.getVendorStaff = exports.staffLogin = exports.createStaff = void 0;
// import { Staff } from "./staff.model";
const hotel_model_1 = require("../hotel/hotel.model");
const staff_validation_1 = require("./staff.validation");
const generateToken_1 = require("../../config/generateToken");
const appError_1 = require("../../errors/appError");
const staff_model_1 = require("./staff.model");
// Create a new staff member (vendor only)
const createStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const { name, email, password, phone, hotelId } = staff_validation_1.staffCreateValidation.parse(req.body);
        // Check if email already exists
        const existingStaff = yield staff_model_1.Staff.findOne({ email });
        if (existingStaff) {
            return next(new appError_1.appError("Email already in use", 400));
        }
        // Check if hotel exists and belongs to the vendor
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: hotelId,
            vendorId: req.user._id,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found or you don't have permission to add staff to this hotel", 404));
        }
        // Create new staff member
        const staff = new staff_model_1.Staff({
            name,
            email,
            password,
            phone,
            hotelId,
            vendorId: req.user._id,
            status: 'active',
            role: 'staff'
        });
        yield staff.save();
        // Remove password from response
        const staffObj = staff.toObject();
        delete staffObj.password;
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Staff member created successfully",
            data: staffObj
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createStaff = createStaff;
// Staff login
const staffLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = staff_validation_1.staffLoginValidation.parse(req.body);
        // Find staff by email
        const staff = yield staff_model_1.Staff.findOne({ email }).populate('hotelId', 'name');
        if (!staff) {
            return next(new appError_1.appError("Invalid email or password", 401));
        }
        // Check if staff is active
        if (staff.status !== 'active') {
            return next(new appError_1.appError("Your account is inactive. Please contact your manager", 403));
        }
        // Verify password
        const isPasswordValid = yield staff.comparePassword(password);
        if (!isPasswordValid) {
            return next(new appError_1.appError("Invalid email or password", 401));
        }
        // Generate token
        const token = (0, generateToken_1.generateToken)(staff);
        // Remove password from response
        const staffObj = staff.toObject();
        delete staffObj.password;
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Staff login successful",
            token,
            data: staffObj
        });
    }
    catch (error) {
        next(error);
    }
});
exports.staffLogin = staffLogin;
// Get all staff members for a vendor
const getVendorStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.Staff.find({
            vendorId: req.user._id
        }).populate('hotelId', 'name').select('-password');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Staff members retrieved successfully",
            data: staff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorStaff = getVendorStaff;
// Get staff by ID
const getStaffById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.Staff.findOne({
            _id: req.params.id,
            vendorId: req.user._id
        }).populate('hotelId', 'name').select('-password');
        if (!staff) {
            return next(new appError_1.appError("Staff member not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Staff member retrieved successfully",
            data: staff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStaffById = getStaffById;
// Update staff
const updateStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = req.params.id;
        // Validate request body
        const validatedData = staff_validation_1.staffUpdateValidation.parse(req.body);
        // Check if staff exists and belongs to the vendor
        const staff = yield staff_model_1.Staff.findOne({
            _id: staffId,
            vendorId: req.user._id
        });
        if (!staff) {
            return next(new appError_1.appError("Staff member not found", 404));
        }
        // If hotelId is being updated, check if hotel exists and belongs to the vendor
        if (validatedData.hotelId) {
            const hotel = yield hotel_model_1.Hotel.findOne({
                _id: validatedData.hotelId,
                vendorId: req.user._id,
                isDeleted: false
            });
            if (!hotel) {
                return next(new appError_1.appError("Hotel not found or you don't have permission to assign staff to this hotel", 404));
            }
        }
        // Update staff
        const updatedStaff = yield staff_model_1.Staff.findByIdAndUpdate(staffId, validatedData, { new: true }).populate('hotelId', 'name').select('-password');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Staff member updated successfully",
            data: updatedStaff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateStaff = updateStaff;
// Delete staff
const deleteStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffId = req.params.id;
        // Check if staff exists and belongs to the vendor
        const staff = yield staff_model_1.Staff.findOne({
            _id: staffId,
            vendorId: req.user._id
        });
        if (!staff) {
            return next(new appError_1.appError("Staff member not found", 404));
        }
        // Delete staff
        yield staff_model_1.Staff.findByIdAndDelete(staffId);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Staff member deleted successfully",
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteStaff = deleteStaff;
// Get hotel menu categories for staff
const getStaffHotelMenu = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Get hotel menu
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Hotel menu retrieved successfully",
            data: {
                hotel: {
                    id: hotel._id,
                    name: hotel.name
                },
                menuCategories: hotel.menuCategories
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStaffHotelMenu = getStaffHotelMenu;
