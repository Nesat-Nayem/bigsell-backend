import mongoose, { Schema } from 'mongoose';
import { IKYC, VerificationResult } from './kyc.interface';
import { encryptionService } from '../../services/encryptionService';

// Verification Result Schema
const VerificationResultSchema = new Schema<VerificationResult>({
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

const KYCSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      required: function() { return this.gstRegistered === 'yes'; }
    },
    
    fssaiNumber: { type: String, trim: true },
    fssaiExpiry: { type: String },
    fssaiUpload: { type: String }, // File path or URL

    // Document Verification Fields
    aadhaarNumber: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v: string) {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(_doc, ret) {
        ret.submittedAt = new Date(ret.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        if (ret.reviewedAt) {
          ret.reviewedAt = new Date(ret.reviewedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

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
KYCSchema.pre('save', function(next) {
  try {
    // Encrypt Aadhaar number if present and not already encrypted
    if (this.aadhaarNumber && typeof this.aadhaarNumber === 'string' && !this.aadhaarNumber.includes(':')) {
      this.aadhaarNumber = encryptionService.encryptDocumentNumber(this.aadhaarNumber, 'aadhaar');
    }

    // Encrypt PAN number if present and not already encrypted
    if (this.panNumber && typeof this.panNumber === 'string' && !this.panNumber.includes(':')) {
      this.panNumber = encryptionService.encryptDocumentNumber(this.panNumber, 'pan');
    }

    // Encrypt GST number if present and not already encrypted
    if (this.gstNumber && typeof this.gstNumber === 'string' && !this.gstNumber.includes(':')) {
      this.gstNumber = encryptionService.encryptDocumentNumber(this.gstNumber, 'gst');
    }

    next();
  } catch (error: any) {
    console.error('Error encrypting document numbers:', error);
    next(error);
  }
});

// Decrypt document numbers after finding documents
KYCSchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  try {
    if (!docs) return;

    const documents = Array.isArray(docs) ? docs : [docs];
    
    documents.forEach((doc: any) => {
      if (doc) {
        // Decrypt Aadhaar number for display
        if (doc.aadhaarNumber && doc.aadhaarNumber.includes(':')) {
          try {
            doc.aadhaarNumber = encryptionService.decryptDocumentNumber(doc.aadhaarNumber, 'aadhaar');
          } catch (error) {
            console.error('Error decrypting Aadhaar number:', error);
            doc.aadhaarNumber = 'DECRYPTION_ERROR';
          }
        }

        // Decrypt PAN number for display
        if (doc.panNumber && doc.panNumber.includes(':')) {
          try {
            doc.panNumber = encryptionService.decryptDocumentNumber(doc.panNumber, 'pan');
          } catch (error) {
            console.error('Error decrypting PAN number:', error);
            doc.panNumber = 'DECRYPTION_ERROR';
          }
        }

        // Decrypt GST number for display
        if (doc.gstNumber && doc.gstNumber.includes(':')) {
          try {
            doc.gstNumber = encryptionService.decryptDocumentNumber(doc.gstNumber, 'gst');
          } catch (error) {
            console.error('Error decrypting GST number:', error);
            doc.gstNumber = 'DECRYPTION_ERROR';
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in post-find decryption hook:', error);
  }
});

// Method to get masked document numbers for display
KYCSchema.methods.getMaskedDocumentNumbers = function() {
  return {
    aadhaar: this.aadhaarNumber ? encryptionService.maskDocumentNumber(this.aadhaarNumber, 'aadhaar') : '',
    pan: this.panNumber ? encryptionService.maskDocumentNumber(this.panNumber, 'pan') : '',
    gst: this.gstNumber ? encryptionService.maskDocumentNumber(this.gstNumber, 'gst') : ''
  };
};

// Static method to find by encrypted document number
KYCSchema.statics.findByDocumentNumber = function(documentNumber: string, documentType: 'aadhaar' | 'pan' | 'gst') {
  const encryptedNumber = encryptionService.encryptDocumentNumber(documentNumber, documentType);
  const fieldName = documentType === 'aadhaar' ? 'aadhaarNumber' : 
                   documentType === 'pan' ? 'panNumber' : 'gstNumber';
  
  return this.findOne({ [fieldName]: encryptedNumber });
};

export const KYC = mongoose.model<IKYC>('KYC', KYCSchema);