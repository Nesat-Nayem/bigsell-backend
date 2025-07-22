/**
 * @swagger
 * components:
 *   schemas:
 *     RefundInfo:
 *       type: object
 *       properties:
 *         refundId:
 *           type: string
 *           description: Refund ID from payment gateway
 *           example: "rfnd_ABC123XYZ"
 *         amount:
 *           type: number
 *           description: Refund amount in paisa
 *           example: 50000
 *         reason:
 *           type: string
 *           description: Reason for refund
 *           example: "Product defective"
 *         status:
 *           type: string
 *           enum: [pending, processed, failed]
 *           description: Refund status
 *           example: "processed"
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Refund processing date
 *           example: "2024-01-15T10:30:00Z"
 *         refundedBy:
 *           type: string
 *           description: Admin user ID who processed refund
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 * 
 *     PaymentGatewayResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Payment ID from gateway
 *           example: "pay_ABC123XYZ"
 *         entity:
 *           type: string
 *           example: "payment"
 *         amount:
 *           type: number
 *           description: Payment amount in paisa
 *           example: 250000
 *         currency:
 *           type: string
 *           example: "INR"
 *         status:
 *           type: string
 *           example: "captured"
 *         order_id:
 *           type: string
 *           example: "order_ABC123XYZ"
 *         method:
 *           type: string
 *           example: "card"
 *         captured:
 *           type: boolean
 *           example: true
 *         email:
 *           type: string
 *           example: "customer@example.com"
 *         contact:
 *           type: string
 *           example: "+919876543210"
 *         created_at:
 *           type: number
 *           description: Unix timestamp
 *           example: 1705312200
 * 
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Payment ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         paymentId:
 *           type: string
 *           description: Internal payment ID
 *           example: "PAY-1705312200000-123"
 *         orderId:
 *           type: object
 *           description: Associated order
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *             orderNumber:
 *               type: string
 *               example: "ORD-1705312200000-123"
 *             totalAmount:
 *               type: number
 *               example: 250000
 *             status:
 *               type: string
 *               example: "confirmed"
 *         userId:
 *           type: object
 *           description: User who made payment
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             phone:
 *               type: string
 *               example: "+8801234567890"
 *         amount:
 *           type: number
 *           description: Payment amount in paisa
 *           example: 250000
 *         currency:
 *           type: string
 *           description: Payment currency
 *           example: "INR"
 *         amountRefunded:
 *           type: number
 *           description: Total refunded amount in paisa
 *           example: 0
 *         method:
 *           type: string
 *           enum: [card, upi, netbanking, wallet, cash_on_delivery]
 *           description: Payment method
 *           example: "card"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *           description: Payment status
 *           example: "completed"
 *         razorpayOrderId:
 *           type: string
 *           description: Razorpay order ID
 *           example: "order_ABC123XYZ"
 *         razorpayPaymentId:
 *           type: string
 *           description: Razorpay payment ID
 *           example: "pay_ABC123XYZ"
 *         razorpaySignature:
 *           type: string
 *           description: Razorpay signature
 *           example: "abc123xyz789"
 *         gatewayResponse:
 *           $ref: '#/components/schemas/PaymentGatewayResponse'
 *         description:
 *           type: string
 *           description: Payment description
 *           example: "Payment for order ORD-1705312200000-123"
 *         notes:
 *           type: object
 *           description: Additional notes
 *           example: {"orderId": "64f8a1b2c3d4e5f6g7h8i9j0"}
 *         customerEmail:
 *           type: string
 *           description: Customer email
 *           example: "customer@example.com"
 *         customerPhone:
 *           type: string
 *           description: Customer phone
 *           example: "+919876543210"
 *         refunds:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RefundInfo'
 *         failureReason:
 *           type: string
 *           description: Payment failure reason
 *           example: "Insufficient funds"
 *         errorCode:
 *           type: string
 *           description: Error code from gateway
 *           example: "PAYMENT_DECLINED"
 *         errorDescription:
 *           type: string
 *           description: Error description
 *           example: "Your payment was declined by the bank"
 *         initiatedAt:
 *           type: string
 *           format: date-time
 *           description: Payment initiation time
 *           example: "2024-01-15T10:00:00Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Payment completion time
 *           example: "2024-01-15T10:05:00Z"
 *         failedAt:
 *           type: string
 *           format: date-time
 *           description: Payment failure time
 *           example: "2024-01-15T10:03:00Z"
 *         ipAddress:
 *           type: string
 *           description: Customer IP address
 *           example: "192.168.1.1"
 *         userAgent:
 *           type: string
 *           description: Customer user agent
 *           example: "Mozilla/5.0..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record update timestamp
 *           example: "2024-01-15T10:05:00Z"
 * 
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - method
 *       properties:
 *         orderId:
 *           type: string
 *           description: Order ID to create payment for
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Payment amount in rupees
 *           example: 2500.00
 *         currency:
 *           type: string
 *           description: Payment currency
 *           example: "INR"
 *           default: "INR"
 *         method:
 *           type: string
 *           enum: [card, upi, netbanking, wallet, cash_on_delivery]
 *           description: Payment method
 *           example: "card"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Payment description
 *           example: "Payment for iPhone 15 Pro Max"
 *         notes:
 *           type: object
 *           description: Additional notes
 *           example: {"customer_id": "123", "order_type": "online"}
 *         customerEmail:
 *           type: string
 *           format: email
 *           description: Customer email (optional, will use order email if not provided)
 *           example: "customer@example.com"
 *         customerPhone:
 *           type: string
 *           description: Customer phone (optional, will use order phone if not provided)
 *           example: "+919876543210"
 * 
 *     PaymentInitiateResponse:
 *       type: object
 *       properties:
 *         paymentId:
 *           type: string
 *           description: Internal payment ID
 *           example: "PAY-1705312200000-123"
 *         orderId:
 *           type: string
 *           description: Order ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         amount:
 *           type: number
 *           description: Payment amount in paisa
 *           example: 250000
 *         currency:
 *           type: string
 *           example: "INR"
 *         method:
 *           type: string
 *           example: "card"
 *         status:
 *           type: string
 *           example: "pending"
 *         razorpayOrderId:
 *           type: string
 *           description: Razorpay order ID (for online payments)
 *           example: "order_ABC123XYZ"
 *         razorpayKeyId:
 *           type: string
 *           description: Razorpay key ID for frontend
 *           example: "rzp_test_1234567890"
 *         razorpayOrder:
 *           type: object
 *           description: Complete Razorpay order object
 * 
 *     VerifyPaymentRequest:
 *       type: object
 *       required:
 *         - razorpay_order_id
 *         - razorpay_payment_id
 *         - razorpay_signature
 *       properties:
 *         razorpay_order_id:
 *           type: string
 *           description: Razorpay order ID
 *           example: "order_ABC123XYZ"
 *         razorpay_payment_id:
 *           type: string
 *           description: Razorpay payment ID
 *           example: "pay_ABC123XYZ"
 *         razorpay_signature:
 *           type: string
 *           description: Razorpay signature for verification
 *           example: "abc123xyz789signature"
 * 
 *     PaymentVerifyResponse:
 *       type: object
 *       properties:
 *         paymentId:
 *           type: string
 *           description: Internal payment ID
 *           example: "PAY-1705312200000-123"
 *         status:
 *           type: string
 *           description: Payment status after verification
 *           example: "completed"
 *         razorpayPaymentId:
 *           type: string
 *           description: Razorpay payment ID
 *           example: "pay_ABC123XYZ"
 *         amount:
 *           type: number
 *           description: Payment amount in paisa
 *           example: 250000
 * 
 *     RefundPaymentRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Refund amount in paisa (optional, defaults to full refund)
 *           example: 50000
 *         reason:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Reason for refund
 *           example: "Product defective"
 *         notes:
 *           type: object
 *           description: Additional refund notes
 *           example: {"refund_type": "quality_issue"}
 * 
 *     PaymentSummary:
 *       type: object
 *       properties:
 *         totalPayments:
 *           type: integer
 *           description: Total number of payments
 *           example: 500
 *         totalAmount:
 *           type: number
 *           description: Total payment amount in paisa
 *           example: 12500000
 *         successfulPayments:
 *           type: integer
 *           description: Number of successful payments
 *           example: 450
 *         failedPayments:
 *           type: integer
 *           description: Number of failed payments
 *           example: 30
 *         pendingPayments:
 *           type: integer
 *           description: Number of pending payments
 *           example: 20
 *         totalRefunded:
 *           type: number
 *           description: Total refunded amount in paisa
 *           example: 500000
 *         methodBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [card, upi, netbanking, wallet, cash_on_delivery]
 *                 example: "card"
 *               count:
 *                 type: integer
 *                 example: 200
 *               amount:
 *                 type: number
 *                 example: 5000000
 * 
 *     PaymentsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Payments retrieved successfully"
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 */

export const PaymentSchemas = {};
