import { Document, Types } from 'mongoose';

export interface VerificationResult {
  documentType: 'aadhaar' | 'pan' | 'gst';
  documentNumber: string;
  status: 'verified' | 'failed' | 'pending';
  verifiedAt: Date;
  verificationId: string;
  details?: {
    name?: string;
    address?: string;
    businessName?: string;
    gstStatus?: 'active' | 'inactive';
  };
  errorCode?: string;
  errorMessage?: string;
}

export interface IKYC extends Document {
  userId?: Types.ObjectId;
  
  // Package Information
  selectedPackage: {
    name: string;
    price: number;
    displayPrice: string;
  };

  // Restaurant Information
  restaurantName: string;
  fullName: string;
  email: string;
  phone: string;
  shopNo?: string;
  floor?: string;
  locality: string;
  city: string;
  landmark?: string;

  // Document Information
  panNumber: string;
  panFullName: string;
  panAddress: string;
  panUpload?: string;
  gstRegistered: 'yes' | 'no';
  gstNumber?: string;
  fssaiNumber?: string;
  fssaiExpiry?: string;
  fssaiUpload?: string;

  // Document Verification Fields
  aadhaarNumber?: string;
  aadhaarVerification?: VerificationResult;
  panVerification?: VerificationResult;
  gstVerification?: VerificationResult;
  documentsVerified?: boolean;
  verificationCompletedAt?: Date;

  // Digital Signature
  signature?: string;

  
  // Status and Review
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: Map<string, string>;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}