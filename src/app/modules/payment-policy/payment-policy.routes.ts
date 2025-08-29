import express from 'express';
import { getPaymentPolicy, updatePaymentPolicy } from './payment-policy.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentPolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Payment policy ID
 *         content:
 *           type: string
 *           description: HTML content of the payment policy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     PaymentPolicyRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the payment policy
 *     PaymentPolicyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/PaymentPolicy'
 */

/**
 * @swagger
 * /v1/api/payment-policy:
 *   get:
 *     summary: Get payment policy
 *     description: Retrieve the current payment policy content. This is a public endpoint that doesn't require authentication.
 *     tags: [Payment Policy]
 *     responses:
 *       200:
 *         description: Payment policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentPolicyResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
// Get payment policy (public)
router.get('/', getPaymentPolicy);

/**
 * @swagger
 * /v1/api/payment-policy:
 *   put:
 *     summary: Update payment policy
 *     description: Update the payment policy content. This endpoint requires admin authentication.
 *     tags: [Payment Policy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentPolicyRequest'
 *           example:
 *             content: "<h1>Payment Policy</h1><p>Updated payment policy content...</p>"
 *     responses:
 *       200:
 *         description: Payment policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentPolicyResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Admin access required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
// Update payment policy (admin only)
router.put('/', auth('admin'), updatePaymentPolicy);

export const paymentPolicyRouter = router;
