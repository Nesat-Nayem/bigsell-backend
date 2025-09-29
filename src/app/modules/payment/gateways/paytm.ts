import crypto from "crypto";
import axios from "axios";

interface PaytmConfig {
  merchant_id: string;
  merchant_key: string;
  website: string;
  industry_type: string;
  channel_id: string;
  test_mode: boolean;
}

interface PaytmOrderOptions {
  orderId: string;
  amount: string;
  custId: string;
  email: string;
  mobile: string;
  callbackUrl: string;
}

class Paytm {
  private config: PaytmConfig;
  private baseUrl: string;
  private statusUrl: string;

  constructor(config: PaytmConfig) {
    this.config = config;
    this.baseUrl = config.test_mode
      ? "https://securegw-stage.paytm.in/order/process"
      : "https://securegw.paytm.in/order/process";
    this.statusUrl = config.test_mode
      ? "https://securegw-stage.paytm.in/order/status"
      : "https://securegw.paytm.in/order/status";
  }

  // Generate checksum for Paytm
  generateChecksum(params: any, key: string): string {
    const data = Object.keys(params)
      .sort()
      .reduce((result: any, k) => {
        if (params[k] !== null && params[k] !== undefined && params[k] !== "") {
          result[k] = params[k];
        }
        return result;
      }, {});

    const paramStr = Object.keys(data)
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    const hash = crypto
      .createHash("sha256")
      .update(paramStr + key)
      .digest("hex");

    return hash;
  }

  // Verify checksum
  verifyChecksum(params: any, checksum: string): boolean {
    const { CHECKSUMHASH, ...otherParams } = params;
    const generatedChecksum = this.generateChecksum(
      otherParams,
      this.config.merchant_key
    );
    return generatedChecksum === checksum;
  }

  // Create Paytm payment order
  async createOrder(options: PaytmOrderOptions) {
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
      const checksumHash = this.generateChecksum(
        paytmParams,
        this.config.merchant_key
      );

      // Create form data for payment
      const formData = {
        ...paytmParams,
        CHECKSUMHASH: checksumHash,
      };

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
    } catch (error: any) {
      throw new Error(`Paytm order creation failed: ${error.message}`);
    }
  }

  // Get transaction status
  async getTransactionStatus(orderId: string): Promise<any> {
    try {
      const params = {
        MID: this.config.merchant_id,
        ORDERID: orderId,
      };

      const checksumHash = this.generateChecksum(
        params,
        this.config.merchant_key
      );

      const requestData = {
        ...params,
        CHECKSUMHASH: checksumHash,
      };

      const response = await axios.post(this.statusUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Paytm status check failed: ${error.message}`);
    }
  }

  // Process refund
  async processRefund(
    orderId: string,
    refId: string,
    amount: string,
    txnId: string
  ): Promise<any> {
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

      const checksumHash = this.generateChecksum(
        params,
        this.config.merchant_key
      );

      const requestData = {
        ...params,
        CHECKSUMHASH: checksumHash,
      };

      const response = await axios.post(refundUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Paytm refund processing failed: ${error.message}`);
    }
  }

  // Get refund status
  async getRefundStatus(orderId: string, refId: string): Promise<any> {
    try {
      const refundStatusUrl = this.config.test_mode
        ? "https://securegw-stage.paytm.in/refund/status"
        : "https://securegw.paytm.in/refund/status";

      const params = {
        MID: this.config.merchant_id,
        ORDERID: orderId,
        REFID: refId,
      };

      const checksumHash = this.generateChecksum(
        params,
        this.config.merchant_key
      );

      const requestData = {
        ...params,
        CHECKSUMHASH: checksumHash,
      };

      const response = await axios.post(refundStatusUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Paytm refund status check failed: ${error.message}`);
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): string[] {
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
  generatePaymentForm(formData: any, paymentUrl: string): string {
    const formFields = Object.keys(formData)
      .map(
        (key) => `<input type="hidden" name="${key}" value="${formData[key]}">`
      )
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

export default Paytm;
