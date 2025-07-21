import { sandboxApiClient, VerificationResult } from './sandboxApiClient';
import { KYC } from '../modules/kyc/kyc.model';
import { appError } from '../errors/appError';
import { Types } from 'mongoose';

interface DocumentValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

class VerificationService {
  // Validation helpers
  private validateAadhaarFormat(aadhaar: string): DocumentValidationResult {
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

  private validatePANFormat(pan: string): DocumentValidationResult {
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

  private validateGSTFormat(gst: string): DocumentValidationResult {
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

  private validateName(name: string): DocumentValidationResult {
    if (!name || name.trim().length < 2) {
      return {
        isValid: false,
        errorMessage: 'Name must be at least 2 characters long'
      };
    }
    
    return { isValid: true };
  }

  // Main verification methods
  async verifyAadhaar(aadhaarNumber: string): Promise<VerificationResult> {
    // Format validation
    const validation = this.validateAadhaarFormat(aadhaarNumber);
    if (!validation.isValid) {
      throw new appError(validation.errorMessage!, 400);
    }

    // Check if Aadhaar is already verified for another user
    const existingVerification = await KYC.findOne({
      aadhaarNumber: aadhaarNumber,
      'aadhaarVerification.status': 'verified'
    });

    if (existingVerification) {
      throw new appError('This Aadhaar number is already verified for another account', 409);
    }

    // Call Sandbox API
    try {
      const result = await sandboxApiClient.verifyAadhaar(aadhaarNumber);
      
      // Log verification attempt (without sensitive data)
      console.log(`Aadhaar verification attempt: ${result.status} - ${result.verificationId}`);
      
      return result;
    } catch (error: any) {
      console.error('Aadhaar verification service error:', error);
      throw error;
    }
  }

  async verifyAadhaarOTP(aadhaarNumber: string, otp: string, sessionId: string): Promise<VerificationResult> {
    // Format validation
    const validation = this.validateAadhaarFormat(aadhaarNumber);
    if (!validation.isValid) {
      throw new appError(validation.errorMessage!, 400);
    }

    // Call Sandbox API for OTP verification
    try {
      const result = await sandboxApiClient.verifyAadhaarOTP(aadhaarNumber, otp, sessionId);
      
      // Log verification attempt (without sensitive data)
      console.log(`Aadhaar OTP verification attempt: ${result.status} - ${result.verificationId}`);
      
      return result;
    } catch (error: any) {
      console.error('Aadhaar OTP verification service error:', error);
      throw error;
    }
  }

  async verifyPAN(panNumber: string, name: string): Promise<VerificationResult> {
    // Format validation
    const panValidation = this.validatePANFormat(panNumber);
    if (!panValidation.isValid) {
      throw new appError(panValidation.errorMessage!, 400);
    }

    const nameValidation = this.validateName(name);
    if (!nameValidation.isValid) {
      throw new appError(nameValidation.errorMessage!, 400);
    }

    // Check if PAN is already verified for another user
    const existingVerification = await KYC.findOne({
      panNumber: panNumber.toUpperCase(),
      'panVerification.status': 'verified'
    });

    if (existingVerification) {
      throw new appError('This PAN number is already verified for another account', 409);
    }

    // Call Sandbox API
    try {
      const result = await sandboxApiClient.verifyPAN(panNumber.toUpperCase(), name.trim());
      
      // Log verification attempt (without sensitive data)
      console.log(`PAN verification attempt: ${result.status} - ${result.verificationId}`);
      
      return result;
    } catch (error: any) {
      console.error('PAN verification service error:', error);
      throw error;
    }
  }

  async verifyGST(gstNumber: string): Promise<VerificationResult> {
    // Format validation
    const validation = this.validateGSTFormat(gstNumber);
    if (!validation.isValid) {
      throw new appError(validation.errorMessage!, 400);
    }

    // Check if GST is already verified for another user
    const existingVerification = await KYC.findOne({
      gstNumber: gstNumber.toUpperCase(),
      'gstVerification.status': 'verified'
    });

    if (existingVerification) {
      throw new appError('This GST number is already verified for another account', 409);
    }

    // Call Sandbox API
    try {
      const result = await sandboxApiClient.verifyGST(gstNumber.toUpperCase());
      
      // Log verification attempt (without sensitive data)
      console.log(`GST verification attempt: ${result.status} - ${result.verificationId}`);
      
      return result;
    } catch (error: any) {
      console.error('GST verification service error:', error);
      throw error;
    }
  }

  // Store verification result in KYC document
  async storeVerificationResult(
    userId: Types.ObjectId | undefined,
    result: VerificationResult
  ): Promise<void> {
    try {
      if (!userId) {
        // For public KYC submissions, we'll store during final submission
        return;
      }

      const updateField = `${result.documentType}Verification`;
      const documentNumberField = result.documentType === 'aadhaar' ? 'aadhaarNumber' : 
                                  result.documentType === 'pan' ? 'panNumber' : 'gstNumber';

      await KYC.findOneAndUpdate(
        { userId },
        {
          $set: {
            [updateField]: result,
            [documentNumberField]: result.documentType === 'aadhaar' ? 
              result.documentNumber.replace(/X/g, '').replace(/-/g, '') : // Store original for Aadhaar
              result.documentNumber // Store masked for PAN/GST
          }
        },
        { upsert: false }
      );

      console.log(`Stored ${result.documentType} verification result for user ${userId}`);
    } catch (error) {
      console.error('Error storing verification result:', error);
      throw new appError('Failed to store verification result', 500);
    }
  }

  // Get verification statistics
  async getVerificationStats(): Promise<{
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
    verificationsByType: {
      aadhaar: { success: number; failed: number };
      pan: { success: number; failed: number };
      gst: { success: number; failed: number };
    };
  }> {
    try {
      const kycDocs = await KYC.find({
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
          const verification = (doc as any)[field];
          if (verification) {
            totalVerifications++;
            const type = field.replace('Verification', '') as 'aadhaar' | 'pan' | 'gst';
            
            if (verification.status === 'verified') {
              successfulVerifications++;
              verificationsByType[type].success++;
            } else {
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
    } catch (error) {
      console.error('Error getting verification stats:', error);
      throw new appError('Failed to get verification statistics', 500);
    }
  }

  // Health check for verification service
  async healthCheck(): Promise<{
    sandboxApi: boolean;
    database: boolean;
    overall: boolean;
  }> {
    const sandboxHealth = await sandboxApiClient.healthCheck();
    
    let databaseHealth = false;
    try {
      await KYC.findOne().limit(1);
      databaseHealth = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    return {
      sandboxApi: sandboxHealth,
      database: databaseHealth,
      overall: sandboxHealth && databaseHealth
    };
  }
}

// Export singleton instance
export const verificationService = new VerificationService();
export { VerificationResult };