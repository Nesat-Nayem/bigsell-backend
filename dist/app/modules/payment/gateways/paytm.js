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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
class Paytm {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.test_mode
            ? "https://securegw-stage.paytm.in/order/process"
            : "https://securegw.paytm.in/order/process";
        this.statusUrl = config.test_mode
            ? "https://securegw-stage.paytm.in/order/status"
            : "https://securegw.paytm.in/order/status";
    }
    // Generate checksum for Paytm
    generateChecksum(params, key) {
        const data = Object.keys(params)
            .sort()
            .reduce((result, k) => {
            if (params[k] !== null && params[k] !== undefined && params[k] !== "") {
                result[k] = params[k];
            }
            return result;
        }, {});
        const paramStr = Object.keys(data)
            .map((key) => `${key}=${data[key]}`)
            .join("&");
        const hash = crypto_1.default
            .createHash("sha256")
            .update(paramStr + key)
            .digest("hex");
        return hash;
    }
    // Verify checksum
    verifyChecksum(params, checksum) {
        const { CHECKSUMHASH } = params, otherParams = __rest(params, ["CHECKSUMHASH"]);
        const generatedChecksum = this.generateChecksum(otherParams, this.config.merchant_key);
        return generatedChecksum === checksum;
    }
    // Create Paytm payment order
    createOrder(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paytmParams = {
                    MID: this.config.merchant_id,
                    WEBSITE: this.config.website,
                    INDUSTRY_TYPE_ID: this.config.industry_type,
                    CHANNEL_ID: this.config.channel_id,
                    ORDER_ID: options.orderId,
                    TXN_AMOUNT: options.amount,
                    CUST_ID: options.custId,
                    EMAIL: options.email,
                    MOBILE_NO: options.mobile,
                    CALLBACK_URL: options.callbackUrl,
                };
                // Generate checksum
                const checksumHash = this.generateChecksum(paytmParams, this.config.merchant_key);
                // Create form data for payment
                const formData = Object.assign(Object.assign({}, paytmParams), { CHECKSUMHASH: checksumHash });
                // Build payment URL
                const paymentUrl = this.baseUrl;
                return {
                    success: true,
                    orderId: options.orderId,
                    checksumHash,
                    paymentUrl,
                    formData,
                    paytmParams,
                };
            }
            catch (error) {
                throw new Error(`Paytm order creation failed: ${error.message}`);
            }
        });
    }
    // Get transaction status
    getTransactionStatus(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    MID: this.config.merchant_id,
                    ORDERID: orderId,
                };
                const checksumHash = this.generateChecksum(params, this.config.merchant_key);
                const requestData = Object.assign(Object.assign({}, params), { CHECKSUMHASH: checksumHash });
                const response = yield axios_1.default.post(this.statusUrl, requestData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return response.data;
            }
            catch (error) {
                throw new Error(`Paytm status check failed: ${error.message}`);
            }
        });
    }
    // Process refund
    processRefund(orderId, refId, amount, txnId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refundUrl = this.config.test_mode
                    ? "https://securegw-stage.paytm.in/refund/apply"
                    : "https://securegw.paytm.in/refund/apply";
                const params = {
                    MID: this.config.merchant_id,
                    ORDERID: orderId,
                    REFID: refId,
                    TXNID: txnId,
                    REFUNDAMOUNT: amount,
                };
                const checksumHash = this.generateChecksum(params, this.config.merchant_key);
                const requestData = Object.assign(Object.assign({}, params), { CHECKSUMHASH: checksumHash });
                const response = yield axios_1.default.post(refundUrl, requestData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return response.data;
            }
            catch (error) {
                throw new Error(`Paytm refund processing failed: ${error.message}`);
            }
        });
    }
    // Get refund status
    getRefundStatus(orderId, refId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refundStatusUrl = this.config.test_mode
                    ? "https://securegw-stage.paytm.in/refund/status"
                    : "https://securegw.paytm.in/refund/status";
                const params = {
                    MID: this.config.merchant_id,
                    ORDERID: orderId,
                    REFID: refId,
                };
                const checksumHash = this.generateChecksum(params, this.config.merchant_key);
                const requestData = Object.assign(Object.assign({}, params), { CHECKSUMHASH: checksumHash });
                const response = yield axios_1.default.post(refundStatusUrl, requestData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return response.data;
            }
            catch (error) {
                throw new Error(`Paytm refund status check failed: ${error.message}`);
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
            "Paytm Wallet",
            "EMI",
            "Postpaid",
        ];
    }
    // Generate payment form HTML
    generatePaymentForm(formData, paymentUrl) {
        const formFields = Object.keys(formData)
            .map((key) => `<input type="hidden" name="${key}" value="${formData[key]}">`)
            .join("\n");
        return `
      <form method="post" action="${paymentUrl}" name="paytm_form" id="paytm_form">
        ${formFields}
        <script type="text/javascript">
          document.paytm_form.submit();
        </script>
      </form>
    `;
    }
}
exports.default = Paytm;
