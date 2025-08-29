import express from 'express';
import { getVendorPolicy, updateVendorPolicy } from './vendor-policy.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     VendorPolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Vendor policy ID
 *         content:
 *           type: string
 *           description: HTML content of the vendor policy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     VendorPolicyRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the vendor policy
 *     VendorPolicyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/VendorPolicy'
 */

/**
 * @swagger
 * /v1/api/vendor-policy:
 *   get:
 *     summary: Get vendor policy
 *     description: Retrieve the current vendor policy content. This is a public endpoint that doesn't require authentication.
 *     tags: [Vendor Policy]
 *     responses:
 *       200:
 *         description: Vendor policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorPolicyResponse'
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
// Get vendor policy (public)
router.get('/', getVendorPolicy);

/**
 * @swagger
 * /v1/api/vendor-policy:
 *   put:
 *     summary: Update vendor policy
 *     description: Update the vendor policy content. This endpoint requires admin authentication.
 *     tags: [Vendor Policy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorPolicyRequest'
 *           example:
 *             content: "<h1>Vendor Policy</h1><p>Updated vendor policy content...</p>"
 *     responses:
 *       200:
 *         description: Vendor policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorPolicyResponse'
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
// Update vendor policy (admin only)
router.put('/', auth('admin'), updateVendorPolicy);

export const vendorPolicyRouter = router;
