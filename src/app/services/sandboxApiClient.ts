import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { appError } from '../errors/appError';

interface SandboxConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeout: number;
  maxRetryAttempts: number;
}

interface VerificationResult {
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
    sessionId?: string;
    requiresOtp?: boolean;
  };
  errorCode?: string;
  errorMessage?: string;
}

interface AadhaarVerificationRequest {
  aadhaar_number: string;
}

interface AadhaarOTPVerificationRequest {
  aadhaar_number: string;
  otp: string;
  session_id: string;
}

interface PANVerificationRequest {
  pan_number: string;
  name: string;
}

interface GSTVerificationRequest {
  gst_number: string;
}

interface SandboxApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error_code?: string;
}

class SandboxApiClient {
  private client: AxiosInstance;
  private config: SandboxConfig;

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

    this.client = axios.create({
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

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making Sandbox API request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Sandbox API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): appError {
    if (error.code === 'ECONNABORTED') {
      return new appError('Verification service timeout. Please try again.', 408);
    }

    if (!error.response) {
      return new appError('Verification service unavailable. Please try again later.', 503);
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        return new appError('Verification service authentication failed.', 500);
      case 429:
        return new appError('Too many verification requests. Please try again later.', 429);
      case 400:
        return new appError(data?.message || 'Invalid document format.', 400);
      case 404:
        return new appError('Document not found in government records.', 404);
      default:
        return new appError('Verification service error. Please try again.', 500);
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempts: number = this.config.maxRetryAttempts
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (attempts > 1 && this.isRetryableError(error)) {
        console.log(`Retrying request, ${attempts - 1} attempts remaining`);
        await this.delay(1000); // Wait 1 second before retry
        return this.retryRequest(requestFn, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' ||
      error.response?.status >= 500 ||
      error.response?.status === 429
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private maskAadhaar(aadhaar: string): string {
    if (aadhaar.length !== 12) return aadhaar;
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }

  private maskPAN(pan: string): string {
    if (pan.length !== 10) return pan;
    return `${pan.slice(0, 3)}XX${pan.slice(-4)}`;
  }

  private maskGST(gst: string): string {
    if (gst.length !== 15) return gst;
    return `${gst.slice(0, 2)}XXXXX${gst.slice(-4)}`;
  }

  async verifyAadhaar(aadhaarNumber: string): Promise<VerificationResult> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<SandboxApiResponse<any>>('/aadhaar/verify', {
          aadhaar_number: aadhaarNumber,
        } as AadhaarVerificationRequest)
      );

      const { data: responseData } = response.data;

      if (response.data.status === 'success' && responseData?.verified) {
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
      } else if (response.data.status === 'success' && responseData?.requires_otp) {
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
      } else {
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
    } catch (error: any) {
      console.error('Aadhaar verification error:', error);
      return {
        documentType: 'aadhaar',
        documentNumber: this.maskAadhaar(aadhaarNumber),
        status: 'failed',
        verifiedAt: new Date(),
        verificationId: `aadhaar_${Date.now()}`,
        errorCode: error.statusCode?.toString() || 'API_ERROR',
        errorMessage: error.message || 'Aadhaar verification failed',
      };
    }
  }

  async verifyAadhaarOTP(aadhaarNumber: string, otp: string, sessionId: string): Promise<VerificationResult> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<SandboxApiResponse<any>>('/aadhaar/verify-otp', {
          aadhaar_number: aadhaarNumber,
          otp: otp,
          session_id: sessionId,
        } as AadhaarOTPVerificationRequest)
      );

      const { data: responseData } = response.data;

      if (response.data.status === 'success' && responseData?.verified) {
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
      } else {
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
    } catch (error: any) {
      console.error('Aadhaar OTP verification error:', error);
      return {
        documentType: 'aadhaar',
        documentNumber: this.maskAadhaar(aadhaarNumber),
        status: 'failed',
        verifiedAt: new Date(),
        verificationId: `aadhaar_${Date.now()}`,
        errorCode: error.statusCode?.toString() || 'API_ERROR',
        errorMessage: error.message || 'OTP verification failed',
      };
    }
  }

  async verifyPAN(panNumber: string, name: string): Promise<VerificationResult> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<SandboxApiResponse<any>>('/pan/verify', {
          pan_number: panNumber,
          name: name,
        } as PANVerificationRequest)
      );

      const { data: responseData } = response.data;

      if (response.data.status === 'success' && responseData?.verified) {
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
      } else {
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
    } catch (error: any) {
      console.error('PAN verification error:', error);
      return {
        documentType: 'pan',
        documentNumber: this.maskPAN(panNumber),
        status: 'failed',
        verifiedAt: new Date(),
        verificationId: `pan_${Date.now()}`,
        errorCode: error.statusCode?.toString() || 'API_ERROR',
        errorMessage: error.message || 'PAN verification failed',
      };
    }
  }

  async verifyGST(gstNumber: string): Promise<VerificationResult> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<SandboxApiResponse<any>>('/gst/verify', {
          gst_number: gstNumber,
        } as GSTVerificationRequest)
      );

      const { data: responseData } = response.data;

      if (response.data.status === 'success' && responseData?.verified) {
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
      } else {
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
    } catch (error: any) {
      console.error('GST verification error:', error);
      return {
        documentType: 'gst',
        documentNumber: this.maskGST(gstNumber),
        status: 'failed',
        verifiedAt: new Date(),
        verificationId: `gst_${Date.now()}`,
        errorCode: error.statusCode?.toString() || 'API_ERROR',
        errorMessage: error.message || 'GST verification failed',
      };
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - you might want to implement a specific endpoint
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Sandbox API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sandboxApiClient = new SandboxApiClient();
export { VerificationResult };