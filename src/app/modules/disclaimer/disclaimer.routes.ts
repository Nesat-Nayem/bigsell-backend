import express from 'express';
import { getDisclaimer, updateDisclaimer } from './disclaimer.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Disclaimer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Disclaimer ID
 *         content:
 *           type: string
 *           description: HTML content of the disclaimer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     DisclaimerRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the disclaimer
 *     DisclaimerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Disclaimer'
 */

/**
 * @swagger
 * /v1/api/disclaimer:
 *   get:
 *     summary: Get disclaimer
 *     description: Retrieve the current disclaimer content. This is a public endpoint that doesn't require authentication.
 *     tags: [Disclaimer]
 *     responses:
 *       200:
 *         description: Disclaimer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisclaimerResponse'
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
// Get disclaimer (public)
router.get('/', getDisclaimer);

/**
 * @swagger
 * /v1/api/disclaimer:
 *   put:
 *     summary: Update disclaimer
 *     description: Update the disclaimer content. This endpoint requires admin authentication.
 *     tags: [Disclaimer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisclaimerRequest'
 *           example:
 *             content: "<h1>Disclaimer</h1><p>Updated disclaimer content...</p>"
 *     responses:
 *       200:
 *         description: Disclaimer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisclaimerResponse'
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
// Update disclaimer (admin only)
router.put('/', auth('admin'), updateDisclaimer);

export const disclaimerRouter = router;
