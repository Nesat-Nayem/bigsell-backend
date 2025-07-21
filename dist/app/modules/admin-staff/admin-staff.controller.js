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
exports.restoreAdminStaff = exports.deleteAdminStaff = exports.updateAdminStaff = exports.getAdminStaffById = exports.getAdminStaff = exports.adminStaffLogin = exports.createAdminStaff = void 0;
const admin_staff_model_1 = require("./admin-staff.model");
const admin_staff_validation_1 = require("./admin-staff.validation");
const generateToken_1 = require("../../config/generateToken");
const appError_1 = require("../../errors/appError");
// Create a new admin staff member (admin only)
const createAdminStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const { name, email, password, phone, permissions } = admin_staff_validation_1.adminStaffCreateValidation.parse(req.body);
        // Check if email already exists
        const existingAdminStaff = yield admin_staff_model_1.AdminStaff.findOne({ email });
        if (existingAdminStaff) {
            return next(new appError_1.appError("Email already in use", 400));
        }
        // Create new admin staff member
        const adminStaff = new admin_staff_model_1.AdminStaff({
            name,
            email,
            password,
            phone,
            permissions,
            createdBy: req.user._id,
            status: 'active',
            role: 'admin-staff'
        });
        yield adminStaff.save();
        // Remove password from response
        const adminStaffObj = adminStaff.toObject();
        delete adminStaffObj.password;
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Admin staff member created successfully",
            data: adminStaffObj
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createAdminStaff = createAdminStaff;
// Admin staff login
const adminStaffLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = admin_staff_validation_1.adminStaffLoginValidation.parse(req.body);
        // Find admin staff by email
        const adminStaff = yield admin_staff_model_1.AdminStaff.findOne({ email });
        if (!adminStaff) {
            return next(new appError_1.appError("Invalid email or password", 401));
        }
        // Check if admin staff is active
        if (adminStaff.status !== 'active') {
            return next(new appError_1.appError("Your account is inactive. Please contact the administrator", 403));
        }
        // Verify password
        const isPasswordValid = yield adminStaff.comparePassword(password);
        if (!isPasswordValid) {
            return next(new appError_1.appError("Invalid email or password", 401));
        }
        // Generate token
        const token = (0, generateToken_1.generateToken)(adminStaff);
        // Remove password from response
        const adminStaffObj = adminStaff.toObject();
        delete adminStaffObj.password;
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff login successful",
            token,
            data: adminStaffObj
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminStaffLogin = adminStaffLogin;
// Get all admin staff members
const getAdminStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deleted } = req.query;
        const filter = { isDeleted: deleted === 'true' };
        const adminStaff = yield admin_staff_model_1.AdminStaff.find(filter).select('-password').populate('createdBy', 'name email');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff members retrieved successfully",
            data: adminStaff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminStaff = getAdminStaff;
// Get admin staff by ID
const getAdminStaffById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminStaff = yield admin_staff_model_1.AdminStaff.findById(req.params.id).select('-password').populate('createdBy', 'name email');
        if (!adminStaff) {
            return next(new appError_1.appError("Admin staff member not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff member retrieved successfully",
            data: adminStaff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminStaffById = getAdminStaffById;
// Update admin staff
const updateAdminStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminStaffId = req.params.id;
        // Validate request body
        const validatedData = admin_staff_validation_1.adminStaffUpdateValidation.parse(req.body);
        // Check if admin staff exists
        const adminStaff = yield admin_staff_model_1.AdminStaff.findById(adminStaffId);
        if (!adminStaff) {
            return next(new appError_1.appError("Admin staff member not found", 404));
        }
        // Check if email is being updated and if it already exists
        if (validatedData.email && validatedData.email !== adminStaff.email) {
            const existingAdminStaff = yield admin_staff_model_1.AdminStaff.findOne({
                email: validatedData.email,
                _id: { $ne: adminStaffId }
            });
            if (existingAdminStaff) {
                return next(new appError_1.appError("Email already in use", 400));
            }
        }
        // Update admin staff
        const updatedAdminStaff = yield admin_staff_model_1.AdminStaff.findByIdAndUpdate(adminStaffId, validatedData, { new: true }).select('-password').populate('createdBy', 'name email');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff member updated successfully",
            data: updatedAdminStaff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateAdminStaff = updateAdminStaff;
// Delete admin staff
const deleteAdminStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminStaffId = req.params.id;
        // Check if admin staff exists
        const adminStaff = yield admin_staff_model_1.AdminStaff.findById(adminStaffId);
        if (!adminStaff) {
            return next(new appError_1.appError("Admin staff member not found", 404));
        }
        // Soft delete admin staff
        adminStaff.isDeleted = true;
        yield adminStaff.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff member deleted successfully",
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteAdminStaff = deleteAdminStaff;
// Restore admin staff
const restoreAdminStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminStaffId = req.params.id;
        // Check if admin staff exists
        const adminStaff = yield admin_staff_model_1.AdminStaff.findById(adminStaffId);
        if (!adminStaff) {
            return next(new appError_1.appError("Admin staff member not found", 404));
        }
        // Restore admin staff
        adminStaff.isDeleted = false;
        yield adminStaff.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin staff member restored successfully",
            data: adminStaff
        });
    }
    catch (error) {
        next(error);
    }
});
exports.restoreAdminStaff = restoreAdminStaff;
