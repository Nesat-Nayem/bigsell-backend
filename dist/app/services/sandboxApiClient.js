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
exports.sandboxApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const appError_1 = require("../errors/appError");
class SandboxApiClient {
    constructor() {
        this.config = {
            apiKey: process.env.SANDBOX_API_KEY || '',
            apiSecret: process.env.SANDBOX_API_SECRET || '',
            baseUrl: process.env.SANDBOX_BASE_URL || 'https://api.sandbox.co.in/v1',
            timeout: parseInt(process.env.VERIFICATION_TIMEOUT || '30000'),
            maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        };
        if (!this.config.apiKey || !this.config.apiSecret ||
            this.config.apiKey === 'test_key_placeholder' ||
            this.config.apiSecret === 'test_secret_placeholder') {
            console.warn('Sandbox API credentials are not properly configured. Using placeholder values.');
        }
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'x-api-secret': this.config.apiSecret,
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor for logging
        this.client.interceptors.request.use((config) => {
            console.log(`Making Sandbox API request to: ${config.url}`);
            return config;
        }, (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            var _a, _b;
            console.error('Sandbox API error:', {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                data: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
                message: error.message,
            });
            return Promise.reject(this.handleApiError(error));
        });
    }
    handleApiError(error) {
        if (error.code === 'ECONNABORTED') {
            return new appError_1.appError('Verification service timeout. Please try again.', 408);
        }
        if (!error.response) {
            return new appError_1.appError('Verification service unavailable. Please try again later.', 503);
        }
        const status = error.response.status;
        const data = error.response.data;
        switch (status) {
            case 401:
                return new appError_1.appError('Verification service authentication failed.', 500);
            case 429:
                return new appError_1.appError('Too many verification requests. Please try again later.', 429);
            case 400:
                return new appError_1.appError((data === null || data === void 0 ? void 0 : data.message) || 'Invalid document format.', 400);
            case 404:
                return new appError_1.appError('Document not found in government records.', 404);
            default:
                return new appError_1.appError('Verification service error. Please try again.', 500);
        }
    }
    retryRequest(requestFn_1) {
        return __awaiter(this, arguments, void 0, function* (requestFn, attempts = this.config.maxRetryAttempts) {
            try {
                return yield requestFn();
            }
            catch (error) {
                if (attempts > 1 && this.isRetryableError(error)) {
                    console.log(`Retrying request, ${attempts - 1} attempts remaining`);
                    yield this.delay(1000); // Wait 1 second before retry
                    return this.retryRequest(requestFn, attempts - 1);
                }
                throw error;
            }
        });
    }
    isRetryableError(error) {
        var _a, _b;
        return (error.code === 'ECONNABORTED' ||
            ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) >= 500 ||
            ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 429);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    maskAadhaar(aadhaar) {
        if (aadhaar.length !== 12)
            return aadhaar;
        return `XXXX-XXXX-${aadhaar.slice(-4)}`;
    }
    maskPAN(pan) {
        if (pan.length !== 10)
            return pan;
        return `${pan.slice(0, 3)}XX${pan.slice(-4)}`;
    }
    maskGST(gst) {
        if (gst.length !== 15)
            return gst;
        return `${gst.slice(0, 2)}XXXXX${gst.slice(-4)}`;
    }
    verifyAadhaar(aadhaarNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.retryRequest(() => this.client.post('/aadhaar/verify', {
                    aadhaar_number: aadhaarNumber,
                }));
                const { data: responseData } = response.data;
                if (response.data.status === 'success' && (responseData === null || responseData === void 0 ? void 0 : responseData.verified)) {
                    return {
                        documentType: 'aadhaar',
                        documentNumber: this.maskAadhaar(aadhaarNumber),
                        status: 'verified',
                        verifiedAt: new Date(),
                        verificationId: `aadhaar_${Date.now()}`,
                        details: {
                            name: responseData.name,
                            address: responseData.address,
                        },
                    };
                }
                else if (response.data.status === 'success' && (responseData === null || responseData === void 0 ? void 0 : responseData.requires_otp)) {
                    // OTP is required for verification
                    return {
                        documentType: 'aadhaar',
                        documentNumber: this.maskAadhaar(aadhaarNumber),
                        status: 'pending',
                        verifiedAt: new Date(),
                        verificationId: `aadhaar_${Date.now()}`,
                        details: {
                            sessionId: responseData.session_id,
                            requiresOtp: true,
                        },
                        errorCode: 'OTP_REQUIRED',
                        errorMessage: 'OTP verification required. Please enter the OTP sent to your registered mobile number.',
                    };
                }
                else {
                    return {
                        documentType: 'aadhaar',
                        documentNumber: this.maskAadhaar(aadhaarNumber),
                        status: 'failed',
                        verifiedAt: new Date(),
                        verificationId: `aadhaar_${Date.now()}`,
                        errorCode: response.data.error_code || 'VERIFICATION_FAILED',
                        errorMessage: response.data.message || 'Aadhaar verification failed',
                    };
                }
            }
            catch (error) {
                console.error('Aadhaar verification error:', error);
                return {
                    documentType: 'aadhaar',
                    documentNumber: this.maskAadhaar(aadhaarNumber),
                    status: 'failed',
                    verifiedAt: new Date(),
                    verificationId: `aadhaar_${Date.now()}`,
                    errorCode: ((_a = error.statusCode) === null || _a === void 0 ? void 0 : _a.toString()) || 'API_ERROR',
                    errorMessage: error.message || 'Aadhaar verification failed',
                };
            }
        });
    }
    verifyAadhaarOTP(aadhaarNumber, otp, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.retryRequest(() => this.client.post('/aadhaar/verify-otp', {
                    aadhaar_number: aadhaarNumber,
                    otp: otp,
                    session_id: sessionId,
                }));
                const { data: responseData } = response.data;
                if (response.data.status === 'success' && (responseData === null || responseData === void 0 ? void 0 : responseData.verified)) {
                    return {
                        documentType: 'aadhaar',
                        documentNumber: this.maskAadhaar(aadhaarNumber),
                        status: 'verified',
                        verifiedAt: new Date(),
                        verificationId: `aadhaar_${Date.now()}`,
                        details: {
                            name: responseData.name,
                            address: responseData.address,
                        },
                    };
                }
                else {
                    return {
                        documentType: 'aadhaar',
                        documentNumber: this.maskAadhaar(aadhaarNumber),
                        status: 'failed',
                        verifiedAt: new Date(),
                        verificationId: `aadhaar_${Date.now()}`,
                        errorCode: response.data.error_code || 'OTP_VERIFICATION_FAILED',
                        errorMessage: response.data.message || 'OTP verification failed',
                    };
                }
            }
            catch (error) {
                console.error('Aadhaar OTP verification error:', error);
                return {
                    documentType: 'aadhaar',
                    documentNumber: this.maskAadhaar(aadhaarNumber),
                    status: 'failed',
                    verifiedAt: new Date(),
                    verificationId: `aadhaar_${Date.now()}`,
                    errorCode: ((_a = error.statusCode) === null || _a === void 0 ? void 0 : _a.toString()) || 'API_ERROR',
                    errorMessage: error.message || 'OTP verification failed',
                };
            }
        });
    }
    verifyPAN(panNumber, name) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.retryRequest(() => this.client.post('/pan/verify', {
                    pan_number: panNumber,
                    name: name,
                }));
                const { data: responseData } = response.data;
                if (response.data.status === 'success' && (responseData === null || responseData === void 0 ? void 0 : responseData.verified)) {
                    const nameMatch = responseData.name_match !== false;
                    return {
                        documentType: 'pan',
                        documentNumber: this.maskPAN(panNumber),
                        status: nameMatch ? 'verified' : 'failed',
                        verifiedAt: new Date(),
                        verificationId: `pan_${Date.now()}`,
                        details: {
                            name: responseData.name,
                        },
                        errorCode: nameMatch ? undefined : 'NAME_MISMATCH',
                        errorMessage: nameMatch ? undefined : 'PAN holder name does not match provided name',
                    };
                }
                else {
                    return {
                        documentType: 'pan',
                        documentNumber: this.maskPAN(panNumber),
                        status: 'failed',
                        verifiedAt: new Date(),
                        verificationId: `pan_${Date.now()}`,
                        errorCode: response.data.error_code || 'VERIFICATION_FAILED',
                        errorMessage: response.data.message || 'PAN verification failed',
                    };
                }
            }
            catch (error) {
                console.error('PAN verification error:', error);
                return {
                    documentType: 'pan',
                    documentNumber: this.maskPAN(panNumber),
                    status: 'failed',
                    verifiedAt: new Date(),
                    verificationId: `pan_${Date.now()}`,
                    errorCode: ((_a = error.statusCode) === null || _a === void 0 ? void 0 : _a.toString()) || 'API_ERROR',
                    errorMessage: error.message || 'PAN verification failed',
                };
            }
        });
    }
    verifyGST(gstNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.retryRequest(() => this.client.post('/gst/verify', {
                    gst_number: gstNumber,
                }));
                const { data: responseData } = response.data;
                if (response.data.status === 'success' && (responseData === null || responseData === void 0 ? void 0 : responseData.verified)) {
                    const isActive = responseData.status === 'active';
                    return {
                        documentType: 'gst',
                        documentNumber: this.maskGST(gstNumber),
                        status: 'verified', // We verify even if inactive, but store the status
                        verifiedAt: new Date(),
                        verificationId: `gst_${Date.now()}`,
                        details: {
                            businessName: responseData.business_name,
                            address: responseData.address,
                            gstStatus: responseData.status,
                        },
                        errorCode: isActive ? undefined : 'GST_INACTIVE',
                        errorMessage: isActive ? undefined : 'GST registration is inactive but verified',
                    };
                }
                else {
                    return {
                        documentType: 'gst',
                        documentNumber: this.maskGST(gstNumber),
                        status: 'failed',
                        verifiedAt: new Date(),
                        verificationId: `gst_${Date.now()}`,
                        errorCode: response.data.error_code || 'VERIFICATION_FAILED',
                        errorMessage: response.data.message || 'GST verification failed',
                    };
                }
            }
            catch (error) {
                console.error('GST verification error:', error);
                return {
                    documentType: 'gst',
                    documentNumber: this.maskGST(gstNumber),
                    status: 'failed',
                    verifiedAt: new Date(),
                    verificationId: `gst_${Date.now()}`,
                    errorCode: ((_a = error.statusCode) === null || _a === void 0 ? void 0 : _a.toString()) || 'API_ERROR',
                    errorMessage: error.message || 'GST verification failed',
                };
            }
        });
    }
    // Health check method
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simple health check - you might want to implement a specific endpoint
                const response = yield this.client.get('/health', { timeout: 5000 });
                return response.status === 200;
            }
            catch (error) {
                console.error('Sandbox API health check failed:', error);
                return false;
            }
        });
    }
}
// Export singleton instance
exports.sandboxApiClient = new SandboxApiClient();
