import express from 'express';
import {
  createPayment,
  verifyPayment,
  getUserPayments,
  getAllPayments,
  getPaymentById,
  refundPayment,
  handleWebhook,
  getPaymentSummary,
  initiateCashfreePayment,
  handleCashfreeReturn,
  handleCashfreeWebhook,
} from './payment.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /v1/api/payments:
 *   post:
 *     summary: "[Deprecated] Create a new payment order (Razorpay legacy)"
 *     deprecated: true
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 *       400:
 *         description: Bad request (invalid order, payment already exists)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/', auth(), createPayment);

/**
 * @swagger
 * /v1/api/payments/verify:
 *   post:
 *     summary: "[Deprecated] Verify Razorpay payment (legacy)"
 *     deprecated: true
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Payment not found
 */
router.post('/verify', auth(), verifyPayment);

/**
 * @swagger
 * /v1/api/payments/cashfree/initiate:
 *   post:
 *     summary: Initiate Cashfree payment for an order
 *     tags: [Cashfree]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Mongo DB Order ID
 *                 example: "66f12a3b5e9f9d1c2a3b4c5d"
 *     responses:
 *       201:
 *         description: Cashfree payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     gateway:
 *                       type: string
 *                       example: "cashfree"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     cashfreeOrderId:
 *                       type: string
 *                     paymentSessionId:
 *                       type: string
 *       400:
 *         description: Bad request or duplicate payment
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/cashfree/initiate', auth(), initiateCashfreePayment);

/**
 * @swagger
 * /v1/api/payments/cashfree/return:
 *   get:
 *     summary: Cashfree return URL (redirect handler)
 *     tags: [Cashfree]
 *     description: Cashfree redirects here after payment. The backend verifies the order with Cashfree, updates DB, and redirects the user to the frontend order page.
 *     parameters:
 *       - in: query
 *         name: our_order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Our internal Order ID (Mongo)
 *       - in: query
 *         name: cf_order_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Cashfree order id (Cashfree may replace this in return URL)
 *     responses:
 *       302:
 *         description: Redirects to frontend order page with payment status
 */
router.get('/cashfree/return', handleCashfreeReturn);

/**
 * @swagger
 * /v1/api/payments/my-payments:
 *   get:
 *     summary: Get current user's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of payments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [card, upi, netbanking, wallet, cash_on_delivery]
 *         description: Filter by payment method
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filter by order ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-initiatedAt"
 *         description: Sort field and order
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentsListResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-payments', auth(), getUserPayments);

/**
 * @swagger
 * /v1/api/payments:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of payments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [card, upi, netbanking, wallet, cash_on_delivery]
 *         description: Filter by payment method
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filter by order ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-initiatedAt"
 *         description: Sort field and order
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentsListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/', auth('admin'), getAllPayments);

/**
 * @swagger
 * /v1/api/payments/{id}:
 *   get:
 *     summary: Get single payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Payment retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:id', auth(), getPaymentById);

/**
 * @swagger
 * /v1/api/payments/{id}/refund:
 *   post:
 *     summary: Refund payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefundPaymentRequest'
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Refund processed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request (invalid refund amount, payment not completed)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Payment not found
 */
router.post('/:id/refund', auth('admin'), refundPayment);

/**
 * @swagger
 * /v1/api/payments/webhook:
 *   post:
 *     summary: "[Deprecated] Razorpay webhook handler (legacy)"
 *     deprecated: true
 *     tags: [Payments]
 *     description: Legacy webhook endpoint for Razorpay payment notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook request
 */
router.post('/webhook', handleWebhook);

/**
 * @swagger
 * /v1/api/payments/cashfree/webhook:
 *   post:
 *     summary: Cashfree webhook handler
 *     tags: [Cashfree]
 *     description: Cashfree sends asynchronous events (e.g., order.paid). We verify signature and update the payment/order.
 *     parameters:
 *       - in: header
 *         name: x-webhook-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC-SHA256 signature of the raw request body using CASHFREE_WEBHOOK_SECRET
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid signature or payload
 */
router.post('/cashfree/webhook', express.raw({ type: 'application/json' }), handleCashfreeWebhook);

/**
 * @swagger
 * /v1/api/payments/summary:
 *   get:
 *     summary: Get payment summary/statistics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to this date
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Payment summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Payment summary retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PaymentSummary'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/summary', auth('admin'), getPaymentSummary);

export const paymentRouter = router;
