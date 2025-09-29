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
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
class CCAvenue {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.test_mode
            ? "https://test.ccavenue.com/transaction/transaction.do"
            : "https://secure.ccavenue.com/transaction/transaction.do";
    }
    // Encrypt data using CCAvenue working key
    encrypt(plainText) {
        const key = this.config.working_key;
        const iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
        const cipher = crypto_1.default.createCipheriv("aes-128-cbc", key, iv);
        let encrypted = cipher.update(plainText, "utf8", "hex");
        encrypted += cipher.final("hex");
        return encrypted;
    }
    // Decrypt response from CCAvenue
    decrypt(encText) {
        const key = this.config.working_key;
        const iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
        const decipher = crypto_1.default.createDecipheriv("aes-128-cbc", key, iv);
        let decrypted = decipher.update(encText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    // Create CCAvenue payment order
    createOrder(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Build merchant data string
                const merchantData = this.buildMerchantData(Object.assign(Object.assign({}, options), { merchant_id: this.config.merchant_id }));
                // Encrypt merchant data
                const encRequest = this.encrypt(merchantData);
                // Create payment URL
                const paymentUrl = `${this.baseUrl}?command=initiateTransaction&merchant_id=${this.config.merchant_id}&encRequest=${encRequest}&access_code=${this.config.access_code}`;
                return {
                    success: true,
                    orderId: options.order_id,
                    encRequest,
                    paymentUrl,
                    merchantData,
                };
            }
            catch (error) {
                throw new Error(`CCAvenue order creation failed: ${error.message}`);
            }
        });
    }
    // Build merchant data string for CCAvenue
    buildMerchantData(data) {
        const params = new URLSearchParams();
        // Required fields
        params.append("merchant_id", data.merchant_id);
        params.append("order_id", data.order_id);
        params.append("amount", data.amount);
        params.append("currency", data.currency);
        params.append("redirect_url", data.redirect_url);
        params.append("cancel_url", data.cancel_url);
        // Billing information
        params.append("billing_name", data.billing_name);
        params.append("billing_address", data.billing_address);
        params.append("billing_city", data.billing_city);
        params.append("billing_state", data.billing_state);
        params.append("billing_zip", data.billing_zip);
        params.append("billing_country", data.billing_country);
        params.append("billing_tel", data.billing_tel);
        params.append("billing_email", data.billing_email);
        // Delivery information
        params.append("delivery_name", data.delivery_name);
        params.append("delivery_address", data.delivery_address);
        params.append("delivery_city", data.delivery_city);
        params.append("delivery_state", data.delivery_state);
        params.append("delivery_zip", data.delivery_zip);
        params.append("delivery_country", data.delivery_country);
        params.append("delivery_tel", data.delivery_tel);
        // Optional merchant parameters
        if (data.merchant_param1) {
            params.append("merchant_param1", data.merchant_param1);
        }
        if (data.merchant_param2) {
            params.append("merchant_param2", data.merchant_param2);
        }
        // Additional optional parameters
        params.append("language", "EN");
        params.append("integration_type", "iframe_normal");
        return params.toString();
    }
    // Verify transaction status
    verifyTransaction(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const merchantData = `merchant_id=${this.config.merchant_id}&order_id=${orderId}&command=orderStatusTracker`;
                const encRequest = this.encrypt(merchantData);
                const response = yield axios_1.default.post("https://api.ccavenue.com/apis/servlet/DoWebTrans", `enc_request=${encRequest}&access_code=${this.config.access_code}&command=orderStatusTracker&request_type=JSON&response_type=JSON`);
                if (response.data && response.data.enc_response) {
                    const decryptedResponse = this.decrypt(response.data.enc_response);
                    return JSON.parse(decryptedResponse);
                }
                throw new Error("Invalid response from CCAvenue");
            }
            catch (error) {
                throw new Error(`CCAvenue transaction verification failed: ${error.message}`);
            }
        });
    }
    // Get supported payment methods
    getSupportedPaymentMethods() {
        return [
            "Credit Card",
            "Debit Card",
            "Net Banking",
            "UPI",
            "Wallet",
            "EMI",
            "Cash Cards",
            "Mobile Payment",
        ];
    }
    // Process refund
    processRefund(orderId, refundAmount, refundRef) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const merchantData = `merchant_id=${this.config.merchant_id}&order_id=${orderId}&refund_amount=${refundAmount}&refund_ref=${refundRef}&command=refundOrder`;
                const encRequest = this.encrypt(merchantData);
                const response = yield axios_1.default.post("https://api.ccavenue.com/apis/servlet/DoWebTrans", `enc_request=${encRequest}&access_code=${this.config.access_code}&command=refundOrder&request_type=JSON&response_type=JSON`);
                if (response.data && response.data.enc_response) {
                    const decryptedResponse = this.decrypt(response.data.enc_response);
                    return JSON.parse(decryptedResponse);
                }
                throw new Error("Invalid response from CCAvenue");
            }
            catch (error) {
                throw new Error(`CCAvenue refund processing failed: ${error.message}`);
            }
        });
    }
}
exports.default = CCAvenue;
