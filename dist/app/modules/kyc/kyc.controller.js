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
exports.healthCheck = exports.getVerificationStats = exports.verifyGST = exports.verifyPAN = exports.verifyAadhaarOTP = exports.verifyAadhaar = exports.getKYCStats = exports.deleteKYC = exports.updateKYC = exports.reviewKYC = exports.getMyKYC = exports.getKYCById = exports.getAllKYCSubmissions = exports.submitKYC = void 0;
const kyc_model_1 = require("./kyc.model");
const auth_model_1 = require("../auth/auth.model");
const kyc_validation_1 = require("./kyc.validation");
const appError_1 = require("../../errors/appError");
const pricing_model_1 = require("../pricing/pricing.model");
const verificationService_1 = require("../../services/verificationService");
// Generate random password
const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};
const submitKYC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate the input
        const validatedData = kyc_validation_1.kycValidation.parse(req.body);
        // Check if user already exists by email or phone
        let user = yield auth_model_1.User.findOne({
            $or: [
                { email: validatedData.email },
                { phone: validatedData.phone }
            ]
        });
        let temporaryPassword = '';
        let isNewUser = false;
        let message = "";
        let packageFeatures = [];
        // Find the pricing plan and get its features
        if ((_a = validatedData.selectedPackage) === null || _a === void 0 ? void 0 : _a._id) {
            const plan = yield pricing_model_1.Pricing.findById(validatedData.selectedPackage._id);
            if (plan) {
                packageFeatures = plan.features;
            }
            else {
                return next(new appError_1.appError("Selected pricing plan not found.", 404));
            }
        }
        else {
            return next(new appError_1.appError("Pricing plan ID is missing.", 400));
        }
        if (user) { // User found by email or phone
            const existingKYCForUser = yield kyc_model_1.KYC.findOne({ userId: user._id });
            if (existingKYCForUser) {
                next(new appError_1.appError("KYC already submitted for this user.", 400));
                return;
            }
            // Update existing user details for KYC
            user.name = validatedData.fullName;
            user.email = validatedData.email; // Ensure email is updated/set
            user.role = 'vendor';
            user.status = 'pending';
            user.packageFeatures = packageFeatures;
            if (!user.password) { // If user was OTP-only and has no password
                temporaryPassword = generateRandomPassword();
                user.password = temporaryPassword; // This will be hashed by pre-save hook
                message = "Existing user updated to vendor, KYC submitted, and temporary password generated.";
            }
            else {
                message = "Existing user KYC submitted.";
            }
            yield user.save();
        }
        else { // No user found, create a new one
            temporaryPassword = generateRandomPassword();
            user = new auth_model_1.User({
                name: validatedData.fullName,
                email: validatedData.email,
                phone: validatedData.phone,
                password: temporaryPassword, // Will be hashed by pre-save hook
                role: 'vendor',
                status: 'pending',
                packageFeatures: packageFeatures,
            });
            yield user.save();
            isNewUser = true;
            message = "New vendor user created and KYC submitted successfully.";
        }
        if (!user || !user._id) {
            next(new appError_1.appError("User creation or update failed, cannot submit KYC.", 500));
            return;
        }
        // Safeguard: Check if KYC details (email/phone) conflict with *another* user's KYC
        const kycConflictCheck = yield kyc_model_1.KYC.findOne({
            $or: [
                { email: validatedData.email },
                { phone: validatedData.phone }
            ],
            userId: { $ne: user._id }
        });
        if (kycConflictCheck) {
            next(new appError_1.appError("KYC details (email/phone) conflict with another existing submission unrelated to this user.", 400));
            return;
        }
        const kyc = new kyc_model_1.KYC(Object.assign(Object.assign({}, validatedData), { userId: user._id, submittedAt: new Date(), status: 'pending' }));
        yield kyc.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: message,
            data: {
                kycId: kyc._id,
                userId: user._id,
                email: user.email,
                temporaryPassword: temporaryPassword || undefined, // Send only if newly generated
                status: 'pending'
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.submitKYC = submitKYC;
const getAllKYCSubmissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        // Get total count
        const totalItems = yield kyc_model_1.KYC.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limit);
        // Get submissions
        const submissions = yield kyc_model_1.KYC.find(filter)
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email phone')
            .populate('reviewedBy', 'name email')
            .lean();
        // Convert Map to plain object for each submission
        const formattedSubmissions = submissions.map(submission => {
            if (submission.adminComments instanceof Map) {
                submission.adminComments = Object.fromEntries(submission.adminComments);
            }
            return submission;
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "KYC submissions retrieved successfully",
            data: {
                submissions: formattedSubmissions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit
                }
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllKYCSubmissions = getAllKYCSubmissions;
const getKYCById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kyc = yield kyc_model_1.KYC.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('reviewedBy', 'name email');
        if (!kyc) {
            next(new appError_1.appError("KYC submission not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "KYC submission retrieved successfully",
            data: kyc,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getKYCById = getKYCById;
const getMyKYC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const kyc = yield kyc_model_1.KYC.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('reviewedBy', 'name email')
            .lean();
        if (!kyc) {
            next(new appError_1.appError("No KYC submission found", 404));
            return;
        }
        // Convert Map to plain object for frontend
        if (kyc.adminComments instanceof Map) {
            kyc.adminComments = Object.fromEntries(kyc.adminComments);
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Your KYC submission retrieved successfully",
            data: kyc,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getMyKYC = getMyKYC;
const reviewKYC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status, adminComments } = req.body;
        const kycId = req.params.id;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            next(new appError_1.appError("Invalid status. Must be 'approved', 'rejected', or 'pending'", 400));
            return;
        }
        const kyc = yield kyc_model_1.KYC.findById(kycId);
        if (!kyc) {
            next(new appError_1.appError("KYC submission not found", 404));
            return;
        }
        // Update KYC status
        kyc.status = status;
        // Handle adminComments - clear existing and add new entries
        if (kyc.adminComments) {
            kyc.adminComments.clear();
            if (adminComments && typeof adminComments === 'object') {
                Object.entries(adminComments).forEach(([key, value]) => {
                    kyc.adminComments.set(key, value);
                });
            }
        }
        kyc.reviewedAt = new Date();
        kyc.reviewedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        yield kyc.save();
        // Update user status based on KYC approval
        if (kyc.userId) {
            const user = yield auth_model_1.User.findById(kyc.userId);
            if (user) {
                if (status === 'approved') {
                    user.status = 'active';
                }
                else if (status === 'rejected') {
                    user.status = 'pending';
                }
                yield user.save();
            }
        }
        // Convert Map back to object for response
        const responseData = kyc.toObject();
        if (responseData.adminComments instanceof Map) {
            responseData.adminComments = Object.fromEntries(responseData.adminComments);
        }
        res.json({
            success: true,
            statusCode: 200,
            message: `KYC ${status} successfully`,
            data: responseData,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.reviewKYC = reviewKYC;
const updateKYC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Find existing KYC
        const existingKYC = yield kyc_model_1.KYC.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!existingKYC) {
            next(new appError_1.appError("No KYC submission found to update", 404));
            return;
        }
        // Only allow updates if status is rejected
        if (existingKYC.status !== 'rejected') {
            next(new appError_1.appError("KYC can only be updated when status is rejected", 400));
            return;
        }
        // Validate update data
        const validatedData = kyc_validation_1.kycUpdateValidation.parse(req.body);
        // Update KYC
        Object.assign(existingKYC, validatedData);
        existingKYC.status = 'pending'; // Reset to pending
        existingKYC.submittedAt = new Date(); // Update submission time
        // Clear previous comments
        if (existingKYC.adminComments) {
            existingKYC.adminComments.clear();
        }
        existingKYC.reviewedAt = undefined;
        existingKYC.reviewedBy = undefined;
        yield existingKYC.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "KYC updated and resubmitted successfully",
            data: existingKYC,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateKYC = updateKYC;
const deleteKYC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const kyc = yield kyc_model_1.KYC.findByIdAndDelete(req.params.id);
        if (!kyc) {
            next(new appError_1.appError("KYC submission not found", 404));
            return;
        }
        // Also delete the associated user if they were created during KYC submission
        if (kyc.userId) {
            const user = yield auth_model_1.User.findById(kyc.userId);
            if (user && user.role === 'vendor' && user.status === 'pending') {
                yield auth_model_1.User.findByIdAndDelete(kyc.userId);
            }
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "KYC submission deleted successfully",
            data: kyc,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteKYC = deleteKYC;
const getKYCStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const stats = yield kyc_model_1.KYC.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const totalSubmissions = yield kyc_model_1.KYC.countDocuments();
        const recentSubmissions = yield kyc_model_1.KYC.find()
            .sort({ submittedAt: -1 })
            .limit(5)
            .populate('userId', 'name email');
        const formattedStats = {
            total: totalSubmissions,
            pending: ((_a = stats.find(s => s._id === 'pending')) === null || _a === void 0 ? void 0 : _a.count) || 0,
            approved: ((_b = stats.find(s => s._id === 'approved')) === null || _b === void 0 ? void 0 : _b.count) || 0,
            rejected: ((_c = stats.find(s => s._id === 'rejected')) === null || _c === void 0 ? void 0 : _c.count) || 0,
            recent: recentSubmissions
        };
        res.json({
            success: true,
            statusCode: 200,
            message: "KYC statistics retrieved successfully",
            data: formattedStats,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getKYCStats = getKYCStats;
// Document Verification Controllers
const verifyAadhaar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = kyc_validation_1.aadhaarVerificationValidation.parse(req.body);
        const { aadhaarNumber } = validatedData;
        const result = yield verificationService_1.verificationService.verifyAadhaar(aadhaarNumber);
        // Return success only if verification is actually successful
        const isSuccess = result.status === 'verified';
        res.json({
            success: isSuccess,
            statusCode: isSuccess ? 200 : 400,
            message: isSuccess ? 'Aadhaar verified successfully' : 'Aadhaar verification failed',
            data: result,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.verifyAadhaar = verifyAadhaar;
const verifyAadhaarOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { aadhaarNumber, otp, sessionId } = req.body;
        if (!aadhaarNumber || !otp || !sessionId) {
            next(new appError_1.appError('Aadhaar number, OTP, and session ID are required', 400));
            return;
        }
        const result = yield verificationService_1.verificationService.verifyAadhaarOTP(aadhaarNumber, otp, sessionId);
        const isSuccess = result.status === 'verified';
        res.json({
            success: isSuccess,
            statusCode: isSuccess ? 200 : 400,
            message: isSuccess ? 'Aadhaar OTP verified successfully' : 'Aadhaar OTP verification failed',
            data: result,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.verifyAadhaarOTP = verifyAadhaarOTP;
const verifyPAN = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = kyc_validation_1.panVerificationValidation.parse(req.body);
        const { panNumber, name } = validatedData;
        const result = yield verificationService_1.verificationService.verifyPAN(panNumber, name);
        res.json({
            success: true,
            statusCode: 200,
            message: result.status === 'verified' ? 'PAN verified successfully' : 'PAN verification failed',
            data: result,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.verifyPAN = verifyPAN;
const verifyGST = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = kyc_validation_1.gstVerificationValidation.parse(req.body);
        const { gstNumber } = validatedData;
        const result = yield verificationService_1.verificationService.verifyGST(gstNumber);
        res.json({
            success: true,
            statusCode: 200,
            message: result.status === 'verified' ? 'GST verified successfully' : 'GST verification failed',
            data: result,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.verifyGST = verifyGST;
const getVerificationStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield verificationService_1.verificationService.getVerificationStats();
        res.json({
            success: true,
            statusCode: 200,
            message: "Verification statistics retrieved successfully",
            data: stats,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getVerificationStats = getVerificationStats;
const healthCheck = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const health = yield verificationService_1.verificationService.healthCheck();
        res.json({
            success: true,
            statusCode: health.overall ? 200 : 503,
            message: health.overall ? "All services are healthy" : "Some services are unhealthy",
            data: health,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.healthCheck = healthCheck;
