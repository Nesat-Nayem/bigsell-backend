import express from 'express';
import { getSiteSecurity, updateSiteSecurity } from './site-security.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SiteSecurity:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Site Security ID
 *         content:
 *           type: string
 *           description: HTML content of the site security
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     SiteSecurityRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the site security
 *     SiteSecurityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/SiteSecurity'
 */

/**
 * @swagger
 * /v1/api/site-security:
 *   get:
 *     summary: Get site security
 *     description: Retrieve the current site security content. This is a public endpoint that doesn't require authentication.
 *     tags: [Site Security]
 *     responses:
 *       200:
 *         description: Site security retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SiteSecurityResponse'
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
// Get site security (public)
router.get('/', getSiteSecurity);

/**
 * @swagger
 * /v1/api/site-security:
 *   put:
 *     summary: Update site security
 *     description: Update the site security content. This endpoint requires admin authentication.
 *     tags: [Site Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteSecurityRequest'
 *           example:
 *             content: "<h1>Site Security</h1><p>Updated site security content...</p>"
 *     responses:
 *       200:
 *         description: Site security updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SiteSecurityResponse'
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
// Update site security (admin only)
router.put('/', auth('admin'), updateSiteSecurity);

export const siteSecurityRouter = router;
