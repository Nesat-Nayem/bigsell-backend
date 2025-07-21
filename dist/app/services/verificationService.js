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
exports.verificationService = void 0;
const sandboxApiClient_1 = require("./sandboxApiClient");
const kyc_model_1 = require("../modules/kyc/kyc.model");
const appError_1 = require("../errors/appError");
class VerificationService {
    // Validation helpers
    validateAadhaarFormat(aadhaar) {
        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaar || aadhaar.length !== 12) {
            return {
                isValid: false,
                errorMessage: 'Aadhaar number must be exactly 12 digits'
            };
        }
        if (!aadhaarRegex.test(aadhaar)) {
            return {
                isValid: false,
                errorMessage: 'Aadhaar number must contain only digits'
            };
        }
        return { isValid: true };
    }
    validatePANFormat(pan) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!pan || pan.length !== 10) {
            return {
                isValid: false,
                errorMessage: 'PAN must be exactly 10 characters'
            };
        }
        if (!panRegex.test(pan.toUpperCase())) {
            return {
                isValid: false,
                errorMessage: 'Invalid PAN format. Expected format: AAAAA9999A'
            };
        }
        return { isValid: true };
    }
    validateGSTFormat(gst) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gst || gst.length !== 15) {
            return {
                isValid: false,
                errorMessage: 'GST number must be exactly 15 characters'
            };
        }
        if (!gstRegex.test(gst.toUpperCase())) {
            return {
                isValid: false,
                errorMessage: 'Invalid GST format'
            };
        }
        return { isValid: true };
    }
    validateName(name) {
        if (!name || name.trim().length < 2) {
            return {
                isValid: false,
                errorMessage: 'Name must be at least 2 characters long'
            };
        }
        return { isValid: true };
    }
    // Main verification methods
    verifyAadhaar(aadhaarNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format validation
            const validation = this.validateAadhaarFormat(aadhaarNumber);
            if (!validation.isValid) {
                throw new appError_1.appError(validation.errorMessage, 400);
            }
            // Check if Aadhaar is already verified for another user
            const existingVerification = yield kyc_model_1.KYC.findOne({
                aadhaarNumber: aadhaarNumber,
                'aadhaarVerification.status': 'verified'
            });
            if (existingVerification) {
                throw new appError_1.appError('This Aadhaar number is already verified for another account', 409);
            }
            // Call Sandbox API
            try {
                const result = yield sandboxApiClient_1.sandboxApiClient.verifyAadhaar(aadhaarNumber);
                // Log verification attempt (without sensitive data)
                console.log(`Aadhaar verification attempt: ${result.status} - ${result.verificationId}`);
                return result;
            }
            catch (error) {
                console.error('Aadhaar verification service error:', error);
                throw error;
            }
        });
    }
    verifyAadhaarOTP(aadhaarNumber, otp, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format validation
            const validation = this.validateAadhaarFormat(aadhaarNumber);
            if (!validation.isValid) {
                throw new appError_1.appError(validation.errorMessage, 400);
            }
            // Call Sandbox API for OTP verification
            try {
                const result = yield sandboxApiClient_1.sandboxApiClient.verifyAadhaarOTP(aadhaarNumber, otp, sessionId);
                // Log verification attempt (without sensitive data)
                console.log(`Aadhaar OTP verification attempt: ${result.status} - ${result.verificationId}`);
                return result;
            }
            catch (error) {
                console.error('Aadhaar OTP verification service error:', error);
                throw error;
            }
        });
    }
    verifyPAN(panNumber, name) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format validation
            const panValidation = this.validatePANFormat(panNumber);
            if (!panValidation.isValid) {
                throw new appError_1.appError(panValidation.errorMessage, 400);
            }
            const nameValidation = this.validateName(name);
            if (!nameValidation.isValid) {
                throw new appError_1.appError(nameValidation.errorMessage, 400);
            }
            // Check if PAN is already verified for another user
            const existingVerification = yield kyc_model_1.KYC.findOne({
                panNumber: panNumber.toUpperCase(),
                'panVerification.status': 'verified'
            });
            if (existingVerification) {
                throw new appError_1.appError('This PAN number is already verified for another account', 409);
            }
            // Call Sandbox API
            try {
                const result = yield sandboxApiClient_1.sandboxApiClient.verifyPAN(panNumber.toUpperCase(), name.trim());
                // Log verification attempt (without sensitive data)
                console.log(`PAN verification attempt: ${result.status} - ${result.verificationId}`);
                return result;
            }
            catch (error) {
                console.error('PAN verification service error:', error);
                throw error;
            }
        });
    }
    verifyGST(gstNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format validation
            const validation = this.validateGSTFormat(gstNumber);
            if (!validation.isValid) {
                throw new appError_1.appError(validation.errorMessage, 400);
            }
            // Check if GST is already verified for another user
            const existingVerification = yield kyc_model_1.KYC.findOne({
                gstNumber: gstNumber.toUpperCase(),
                'gstVerification.status': 'verified'
            });
            if (existingVerification) {
                throw new appError_1.appError('This GST number is already verified for another account', 409);
            }
            // Call Sandbox API
            try {
                const result = yield sandboxApiClient_1.sandboxApiClient.verifyGST(gstNumber.toUpperCase());
                // Log verification attempt (without sensitive data)
                console.log(`GST verification attempt: ${result.status} - ${result.verificationId}`);
                return result;
            }
            catch (error) {
                console.error('GST verification service error:', error);
                throw error;
            }
        });
    }
    // Store verification result in KYC document
    storeVerificationResult(userId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    // For public KYC submissions, we'll store during final submission
                    return;
                }
                const updateField = `${result.documentType}Verification`;
                const documentNumberField = result.documentType === 'aadhaar' ? 'aadhaarNumber' :
                    result.documentType === 'pan' ? 'panNumber' : 'gstNumber';
                yield kyc_model_1.KYC.findOneAndUpdate({ userId }, {
                    $set: {
                        [updateField]: result,
                        [documentNumberField]: result.documentType === 'aadhaar' ?
                            result.documentNumber.replace(/X/g, '').replace(/-/g, '') : // Store original for Aadhaar
                            result.documentNumber // Store masked for PAN/GST
                    }
                }, { upsert: false });
                console.log(`Stored ${result.documentType} verification result for user ${userId}`);
            }
            catch (error) {
                console.error('Error storing verification result:', error);
                throw new appError_1.appError('Failed to store verification result', 500);
            }
        });
    }
    // Get verification statistics
    getVerificationStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const kycDocs = yield kyc_model_1.KYC.find({
                    $or: [
                        { aadhaarVerification: { $exists: true } },
                        { panVerification: { $exists: true } },
                        { gstVerification: { $exists: true } }
                    ]
                }).lean();
                let totalVerifications = 0;
                let successfulVerifications = 0;
                let failedVerifications = 0;
                const verificationsByType = {
                    aadhaar: { success: 0, failed: 0 },
                    pan: { success: 0, failed: 0 },
                    gst: { success: 0, failed: 0 }
                };
                kycDocs.forEach(doc => {
                    ['aadhaarVerification', 'panVerification', 'gstVerification'].forEach(field => {
                        const verification = doc[field];
                        if (verification) {
                            totalVerifications++;
                            const type = field.replace('Verification', '');
                            if (verification.status === 'verified') {
                                successfulVerifications++;
                                verificationsByType[type].success++;
                            }
                            else {
                                failedVerifications++;
                                verificationsByType[type].failed++;
                            }
                        }
                    });
                });
                return {
                    totalVerifications,
                    successfulVerifications,
                    failedVerifications,
                    verificationsByType
                };
            }
            catch (error) {
                console.error('Error getting verification stats:', error);
                throw new appError_1.appError('Failed to get verification statistics', 500);
            }
        });
    }
    // Health check for verification service
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            const sandboxHealth = yield sandboxApiClient_1.sandboxApiClient.healthCheck();
            let databaseHealth = false;
            try {
                yield kyc_model_1.KYC.findOne().limit(1);
                databaseHealth = true;
            }
            catch (error) {
                console.error('Database health check failed:', error);
            }
            return {
                sandboxApi: sandboxHealth,
                database: databaseHealth,
                overall: sandboxHealth && databaseHealth
            };
        });
    }
}
// Export singleton instance
exports.verificationService = new VerificationService();
