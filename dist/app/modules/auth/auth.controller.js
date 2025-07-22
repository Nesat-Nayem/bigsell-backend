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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailExists = exports.checkPhoneExists = exports.activateUser = exports.resetPassword = exports.getUserById = exports.getAllUsers = exports.loginController = exports.updateUser = exports.verifyOtp = exports.requestOtp = exports.singUpController = void 0;
const auth_model_1 = require("./auth.model");
const auth_validation_1 = require("./auth.validation");
const generateToken_1 = require("../../config/generateToken");
// import { AdminStaff } from "../admin-staff/admin-staff.model";
const singUpController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, img, phone, email, role } = auth_validation_1.authValidation.parse(req.body);
        // Check for existing email
        const existingEmail = yield auth_model_1.User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Email already exists",
            });
            return;
        }
        // Check for existing phone
        const existingPhone = yield auth_model_1.User.findOne({ phone });
        if (existingPhone) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Phone number already exists",
            });
            return;
        }
        const user = new auth_model_1.User({ name, password, img, phone, email, role });
        yield user.save();
        const _a = user.toObject(), { password: _ } = _a, userObject = __rest(_a, ["password"]);
        res.status(201).json({
            success: true,
            statusCode: 200,
            message: "User registered successfully",
            data: userObject,
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
    }
});
exports.singUpController = singUpController;
// Add these functions to your existing controller file
// Utility function to generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
// Request OTP handler
const requestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = auth_validation_1.requestOtpValidation.parse(req.body);
        // Find or create user
        let user = yield auth_model_1.User.findOne({ phone });
        if (!user) {
            user = new auth_model_1.User({
                phone,
                role: 'user',
                status: 'active'
            });
        }
        // Generate OTP and set expiration
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        yield user.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "OTP sent successfully",
            data: {
                otp,
                phone
            }
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.requestOtp = requestOtp;
// Verify OTP and login
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, otp } = auth_validation_1.verifyOtpValidation.parse(req.body);
        // Find user by phone
        const user = yield auth_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found"
            });
            return;
        }
        // Check if OTP is valid and not expired
        if (!user.compareOtp(otp)) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Invalid or expired OTP"
            });
            return;
        }
        // Generate token for the user
        const token = (0, generateToken_1.generateToken)(user);
        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        yield user.save();
        // Remove password from response
        const _a = user.toObject(), { password: _ } = _a, userObject = __rest(_a, ["password"]);
        res.json({
            success: true,
            statusCode: 200,
            message: "OTP verified successfully",
            token,
            data: userObject
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.verifyOtp = verifyOtp;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a clean request body by filtering out undefined/null values
        const cleanBody = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v !== undefined && v !== null));
        // Validate the clean data
        const validatedData = auth_validation_1.updateUserValidation.parse(cleanBody);
        // Check if email is being updated with a non-empty value and if it already exists
        if (validatedData.email && validatedData.email.length > 0) {
            const existingUser = yield auth_model_1.User.findOne({
                email: validatedData.email,
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Email already exists"
                });
                return;
            }
        }
        // If email is empty string, remove it from update data
        if (validatedData.email === '') {
            delete validatedData.email;
        }
        const updatedUser = yield auth_model_1.User.findByIdAndUpdate(req.params.id, validatedData, { new: true, select: '-password' });
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found"
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "User updated successfully",
            data: updatedUser
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
    }
});
exports.updateUser = updateUser;
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = auth_validation_1.loginValidation.parse(req.body);
        // First try to find in User model
        let user = yield auth_model_1.User.findOne({ email });
        let userType = 'user';
        // If not found in User model, try AdminStaff model
        // if (!user) {
        //   user = await AdminStaff.findOne({ email });
        //   userType = 'admin-staff';
        // }
        if (!user) {
            res.status(401).json({
                success: false,
                statusCode: 400,
                message: "Invalid email or password",
            });
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                statusCode: 400,
                message: "Invalid email or password",
            });
            return;
        }
        const token = (0, generateToken_1.generateToken)(user);
        // remove password
        const _a = user.toObject(), { password: _ } = _a, userObject = __rest(_a, ["password"]);
        res.json({
            success: true,
            statusCode: 200,
            message: "User logged in successfully",
            token,
            data: userObject,
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
        return;
    }
});
exports.loginController = loginController;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield auth_model_1.User.find({}, { password: 0 });
        if (users.length === 0) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "No users found",
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Users retrieved successfully",
            data: users,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
        return;
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield auth_model_1.User.findById(req.params.id, { password: 0 });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found",
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "User retrieved successfully",
            data: user,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message
        });
        return;
    }
});
exports.getUserById = getUserById;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, newPassword } = auth_validation_1.resetPasswordValidation.parse(req.body);
        const user = yield auth_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found"
            });
            return;
        }
        user.password = newPassword;
        yield user.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Password reset successfully"
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
        return;
    }
});
exports.resetPassword = resetPassword;
const activateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = auth_validation_1.activateUserValidation.parse(req.body);
        const user = yield auth_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found"
            });
            return;
        }
        user.status = 'active';
        yield user.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "User activated successfully"
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
        return;
    }
});
exports.activateUser = activateUser;
const checkPhoneExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = auth_validation_1.phoneCheckValidation.parse(req.body);
        const user = yield auth_model_1.User.findOne({ phone });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Phone number not found"
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Phone number exists",
            data: {
                exists: true,
                phone: user.phone
            }
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
        return;
    }
});
exports.checkPhoneExists = checkPhoneExists;
const checkEmailExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = auth_validation_1.emailCheckValidation.parse(req.body);
        const user = yield auth_model_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Email not found"
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Email exists",
            data: {
                exists: true,
                email: user.email
            }
        });
        return;
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message
        });
        return;
    }
});
exports.checkEmailExists = checkEmailExists;
