"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYC = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const encryptionService_1 = require("../../services/encryptionService");
// Verification Result Schema
const VerificationResultSchema = new mongoose_1.Schema({
    documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'gst'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['verified', 'failed', 'pending'],
        required: true
    },
    verifiedAt: {
        type: Date,
        required: true
    },
    verificationId: {
        type: String,
        required: true
    },
    details: {
        name: { type: String },
        address: { type: String },
        businessName: { type: String },
        gstStatus: {
            type: String,
            enum: ['active', 'inactive']
        }
    },
    errorCode: { type: String },
    errorMessage: { type: String }
}, { _id: false });
const KYCSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for public submissions
    },
    // Package Information
    selectedPackage: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        displayPrice: { type: String, required: true }
    },
    // Restaurant Information
    restaurantName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    shopNo: { type: String, trim: true },
    floor: { type: String, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    // Document Information
    panNumber: { type: String, required: true, trim: true, uppercase: true },
    panFullName: { type: String, required: true, trim: true },
    panAddress: { type: String, required: true, trim: true },
    panUpload: { type: String }, // File path or URL
    gstRegistered: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        required: function () { return this.gstRegistered === 'yes'; }
    },
    fssaiNumber: { type: String, trim: true },
    fssaiExpiry: { type: String },
    fssaiUpload: { type: String }, // File path or URL
    // Document Verification Fields
    aadhaarNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^\d{12}$/.test(v);
            },
            message: 'Aadhaar number must be exactly 12 digits'
        }
    },
    aadhaarVerification: VerificationResultSchema,
    panVerification: VerificationResultSchema,
    gstVerification: VerificationResultSchema,
    documentsVerified: {
        type: Boolean,
        default: false
    },
    verificationCompletedAt: { type: Date },
    // Digital Signature
    signature: { type: String }, // Base64 encoded signature
    // Status and Review
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminComments: {
        type: Map,
        of: String,
        default: {}
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            ret.submittedAt = new Date(ret.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            if (ret.reviewedAt) {
                ret.reviewedAt = new Date(ret.reviewedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
    }
});
// Indexes for better performance
KYCSchema.index({ email: 1 });
KYCSchema.index({ phone: 1 });
KYCSchema.index({ userId: 1 });
KYCSchema.index({ status: 1 });
KYCSchema.index({ submittedAt: -1 });
// Verification-specific indexes
KYCSchema.index({ aadhaarNumber: 1 });
KYCSchema.index({ 'aadhaarVerification.status': 1 });
KYCSchema.index({ 'panVerification.status': 1 });
KYCSchema.index({ 'gstVerification.status': 1 });
KYCSchema.index({ documentsVerified: 1 });
KYCSchema.index({ verificationCompletedAt: -1 });
// Encryption hooks for sensitive document numbers
KYCSchema.pre('save', function (next) {
    try {
        // Encrypt Aadhaar number if present and not already encrypted
        if (this.aadhaarNumber && typeof this.aadhaarNumber === 'string' && !this.aadhaarNumber.includes(':')) {
            this.aadhaarNumber = encryptionService_1.encryptionService.encryptDocumentNumber(this.aadhaarNumber, 'aadhaar');
        }
        // Encrypt PAN number if present and not already encrypted
        if (this.panNumber && typeof this.panNumber === 'string' && !this.panNumber.includes(':')) {
            this.panNumber = encryptionService_1.encryptionService.encryptDocumentNumber(this.panNumber, 'pan');
        }
        // Encrypt GST number if present and not already encrypted
        if (this.gstNumber && typeof this.gstNumber === 'string' && !this.gstNumber.includes(':')) {
            this.gstNumber = encryptionService_1.encryptionService.encryptDocumentNumber(this.gstNumber, 'gst');
        }
        next();
    }
    catch (error) {
        console.error('Error encrypting document numbers:', error);
        next(error);
    }
});
// Decrypt document numbers after finding documents
KYCSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
    try {
        if (!docs)
            return;
        const documents = Array.isArray(docs) ? docs : [docs];
        documents.forEach((doc) => {
            if (doc) {
                // Decrypt Aadhaar number for display
                if (doc.aadhaarNumber && doc.aadhaarNumber.includes(':')) {
                    try {
                        doc.aadhaarNumber = encryptionService_1.encryptionService.decryptDocumentNumber(doc.aadhaarNumber, 'aadhaar');
                    }
                    catch (error) {
                        console.error('Error decrypting Aadhaar number:', error);
                        doc.aadhaarNumber = 'DECRYPTION_ERROR';
                    }
                }
                // Decrypt PAN number for display
                if (doc.panNumber && doc.panNumber.includes(':')) {
                    try {
                        doc.panNumber = encryptionService_1.encryptionService.decryptDocumentNumber(doc.panNumber, 'pan');
                    }
                    catch (error) {
                        console.error('Error decrypting PAN number:', error);
                        doc.panNumber = 'DECRYPTION_ERROR';
                    }
                }
                // Decrypt GST number for display
                if (doc.gstNumber && doc.gstNumber.includes(':')) {
                    try {
                        doc.gstNumber = encryptionService_1.encryptionService.decryptDocumentNumber(doc.gstNumber, 'gst');
                    }
                    catch (error) {
                        console.error('Error decrypting GST number:', error);
                        doc.gstNumber = 'DECRYPTION_ERROR';
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Error in post-find decryption hook:', error);
    }
});
// Method to get masked document numbers for display
KYCSchema.methods.getMaskedDocumentNumbers = function () {
    return {
        aadhaar: this.aadhaarNumber ? encryptionService_1.encryptionService.maskDocumentNumber(this.aadhaarNumber, 'aadhaar') : '',
        pan: this.panNumber ? encryptionService_1.encryptionService.maskDocumentNumber(this.panNumber, 'pan') : '',
        gst: this.gstNumber ? encryptionService_1.encryptionService.maskDocumentNumber(this.gstNumber, 'gst') : ''
    };
};
// Static method to find by encrypted document number
KYCSchema.statics.findByDocumentNumber = function (documentNumber, documentType) {
    const encryptedNumber = encryptionService_1.encryptionService.encryptDocumentNumber(documentNumber, documentType);
    const fieldName = documentType === 'aadhaar' ? 'aadhaarNumber' :
        documentType === 'pan' ? 'panNumber' : 'gstNumber';
    return this.findOne({ [fieldName]: encryptedNumber });
};
exports.KYC = mongoose_1.default.model('KYC', KYCSchema);
