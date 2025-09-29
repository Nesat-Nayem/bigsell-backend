import crypto from "crypto";
import axios from "axios";

interface CCCAvenueConfig {
  merchant_id: string;
  access_code: string;
  working_key: string;
  test_mode: boolean;
}

interface CCCAvenueOrderOptions {
  order_id: string;
  amount: string;
  currency: string;
  redirect_url: string;
  cancel_url: string;
  billing_name: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  billing_tel: string;
  billing_email: string;
  delivery_name: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  delivery_country: string;
  delivery_tel: string;
  merchant_param1?: string;
  merchant_param2?: string;
}

class CCAvenue {
  private config: CCCAvenueConfig;
  private baseUrl: string;

  constructor(config: CCCAvenueConfig) {
    this.config = config;
    this.baseUrl = config.test_mode
      ? "https://test.ccavenue.com/transaction/transaction.do"
      : "https://secure.ccavenue.com/transaction/transaction.do";
  }

  // Encrypt data using CCAvenue working key
  encrypt(plainText: string): string {
    const key = this.config.working_key;
    const iv =
      "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  // Decrypt response from CCAvenue
  decrypt(encText: string): string {
    const key = this.config.working_key;
    const iv =
      "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

    let decrypted = decipher.update(encText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Create CCAvenue payment order
  async createOrder(options: CCCAvenueOrderOptions) {
    try {
      // Build merchant data string
      const merchantData = this.buildMerchantData({
        ...options,
        merchant_id: this.config.merchant_id,
      });

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
    } catch (error: any) {
      throw new Error(`CCAvenue order creation failed: ${error.message}`);
    }
  }

  // Build merchant data string for CCAvenue
  private buildMerchantData(data: any): string {
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
  async verifyTransaction(orderId: string): Promise<any> {
    try {
      const merchantData = `merchant_id=${this.config.merchant_id}&order_id=${orderId}&command=orderStatusTracker`;
      const encRequest = this.encrypt(merchantData);

      const response = await axios.post(
        "https://api.ccavenue.com/apis/servlet/DoWebTrans",
        `enc_request=${encRequest}&access_code=${this.config.access_code}&command=orderStatusTracker&request_type=JSON&response_type=JSON`
      );

      if (response.data && response.data.enc_response) {
        const decryptedResponse = this.decrypt(response.data.enc_response);
        return JSON.parse(decryptedResponse);
      }

      throw new Error("Invalid response from CCAvenue");
    } catch (error: any) {
      throw new Error(
        `CCAvenue transaction verification failed: ${error.message}`
      );
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): string[] {
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
  async processRefund(
    orderId: string,
    refundAmount: string,
    refundRef: string
  ): Promise<any> {
    try {
      const merchantData = `merchant_id=${this.config.merchant_id}&order_id=${orderId}&refund_amount=${refundAmount}&refund_ref=${refundRef}&command=refundOrder`;
      const encRequest = this.encrypt(merchantData);

      const response = await axios.post(
        "https://api.ccavenue.com/apis/servlet/DoWebTrans",
        `enc_request=${encRequest}&access_code=${this.config.access_code}&command=refundOrder&request_type=JSON&response_type=JSON`
      );

      if (response.data && response.data.enc_response) {
        const decryptedResponse = this.decrypt(response.data.enc_response);
        return JSON.parse(decryptedResponse);
      }

      throw new Error("Invalid response from CCAvenue");
    } catch (error: any) {
      throw new Error(`CCAvenue refund processing failed: ${error.message}`);
    }
  }
}

export default CCAvenue;
