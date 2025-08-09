import express from 'express';
import { getPrivacyPolicy, updatePrivacyPolicy } from './privacy-policy.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PrivacyPolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Privacy policy ID
 *         content:
 *           type: string
 *           description: HTML content of the privacy policy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     PrivacyPolicyRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the privacy policy
 *     PrivacyPolicyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/PrivacyPolicy'
 */

/**
 * @swagger
 * /v1/api/privacy-policy:
 *   get:
 *     summary: Get privacy policy
 *     description: Retrieve the current privacy policy content. This is a public endpoint that doesn't require authentication.
 *     tags: [Privacy Policy]
 *     responses:
 *       200:
 *         description: Privacy policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivacyPolicyResponse'
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
// Get privacy policy (public)
router.get('/', getPrivacyPolicy);

/**
 * @swagger
 * /v1/api/privacy-policy:
 *   put:
 *     summary: Update privacy policy
 *     description: Update the privacy policy content. This endpoint requires admin authentication.
 *     tags: [Privacy Policy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivacyPolicyRequest'
 *           example:
 *             content: "<h1>Privacy Policy</h1><p>Updated privacy policy content...</p>"
 *     responses:
 *       200:
 *         description: Privacy policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrivacyPolicyResponse'
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
// Update privacy policy (admin only)
router.put('/', auth('admin'), updatePrivacyPolicy);


export const privacyPolicyRouter = router;