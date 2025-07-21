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
exports.EncryptionService = exports.encryptionService = void 0;
const crypto = __importStar(require("crypto"));
const appError_1 = require("../errors/appError");
class EncryptionService {
    constructor() {
        this.config = {
            algorithm: 'aes-256-cbc',
            secretKey: process.env.ENCRYPTION_SECRET_KEY || this.generateDefaultKey(),
            ivLength: 16,
        };
        if (!process.env.ENCRYPTION_SECRET_KEY) {
            console.warn('ENCRYPTION_SECRET_KEY not set in environment variables. Using generated key.');
        }
    }
    generateDefaultKey() {
        // Generate a default key for development - should be set in production
        return crypto.scryptSync('default-kyc-encryption-key', 'salt', 32).toString('hex');
    }
    getKey() {
        return Buffer.from(this.config.secretKey, 'hex');
    }
    /**
     * Encrypt sensitive data
     * @param text - The text to encrypt
     * @returns Encrypted string in format: iv:encryptedData
     */
    encrypt(text) {
        try {
            if (!text) {
                throw new appError_1.appError('Text to encrypt cannot be empty', 400);
            }
            const iv = crypto.randomBytes(this.config.ivLength);
            const cipher = crypto.createCipheriv(this.config.algorithm, this.getKey(), iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            // Return format: iv:encryptedData
            return `${iv.toString('hex')}:${encrypted}`;
        }
        catch (error) {
            console.error('Encryption error:', error);
            throw new appError_1.appError('Failed to encrypt data', 500);
        }
    }
    /**
     * Decrypt sensitive data
     * @param encryptedText - The encrypted text in format: iv:encryptedData
     * @returns Decrypted string
     */
    decrypt(encryptedText) {
        try {
            if (!encryptedText) {
                throw new appError_1.appError('Encrypted text cannot be empty', 400);
            }
            const parts = encryptedText.split(':');
            if (parts.length !== 2) {
                throw new appError_1.appError('Invalid encrypted data format', 400);
            }
            const [ivHex, encrypted] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(this.config.algorithm, this.getKey(), iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            console.error('Decryption error:', error);
            throw new appError_1.appError('Failed to decrypt data', 500);
        }
    }
    /**
     * Encrypt document number for storage
     * @param documentNumber - The document number to encrypt
     * @param documentType - Type of document for additional context
     * @returns Encrypted document number
     */
    encryptDocumentNumber(documentNumber, documentType) {
        if (!documentNumber) {
            return '';
        }
        // Add document type as prefix for additional security context
        const dataToEncrypt = `${documentType}:${documentNumber}`;
        return this.encrypt(dataToEncrypt);
    }
    /**
     * Decrypt document number from storage
     * @param encryptedDocumentNumber - The encrypted document number
     * @param expectedDocumentType - Expected document type for validation
     * @returns Decrypted document number
     */
    decryptDocumentNumber(encryptedDocumentNumber, expectedDocumentType) {
        if (!encryptedDocumentNumber) {
            return '';
        }
        try {
            const decryptedData = this.decrypt(encryptedDocumentNumber);
            const [documentType, documentNumber] = decryptedData.split(':');
            if (documentType !== expectedDocumentType) {
                throw new appError_1.appError('Document type mismatch during decryption', 400);
            }
            return documentNumber;
        }
        catch (error) {
            console.error('Document decryption error:', error);
            throw new appError_1.appError('Failed to decrypt document number', 500);
        }
    }
    /**
     * Hash sensitive data for indexing (one-way)
     * @param data - Data to hash
     * @returns SHA-256 hash
     */
    hashForIndex(data) {
        if (!data) {
            return '';
        }
        return crypto
            .createHash('sha256')
            .update(data + this.config.secretKey)
            .digest('hex');
    }
    /**
     * Mask document number for display
     * @param documentNumber - Document number to mask
     * @param documentType - Type of document
     * @returns Masked document number
     */
    maskDocumentNumber(documentNumber, documentType) {
        if (!documentNumber) {
            return '';
        }
        switch (documentType) {
            case 'aadhaar':
                if (documentNumber.length !== 12)
                    return documentNumber;
                return `XXXX-XXXX-${documentNumber.slice(-4)}`;
            case 'pan':
                if (documentNumber.length !== 10)
                    return documentNumber;
                return `${documentNumber.slice(0, 3)}XX${documentNumber.slice(-4)}`;
            case 'gst':
                if (documentNumber.length !== 15)
                    return documentNumber;
                return `${documentNumber.slice(0, 2)}XXXXX${documentNumber.slice(-4)}`;
            default:
                return documentNumber;
        }
    }
    /**
     * Generate a secure verification ID
     * @param documentType - Type of document
     * @returns Secure verification ID
     */
    generateVerificationId(documentType) {
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        return `${documentType}_${timestamp}_${randomBytes}`;
    }
    /**
     * Validate encryption configuration
     * @returns Boolean indicating if encryption is properly configured
     */
    validateConfiguration() {
        try {
            const testData = 'test-encryption-data';
            const encrypted = this.encrypt(testData);
            const decrypted = this.decrypt(encrypted);
            return decrypted === testData;
        }
        catch (error) {
            console.error('Encryption configuration validation failed:', error);
            return false;
        }
    }
}
exports.EncryptionService = EncryptionService;
// Export singleton instance
exports.encryptionService = new EncryptionService();
