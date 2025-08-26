import express from 'express';
import { getTermsCondition, updateTermsCondition } from './terms-condition.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TermsCondition:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Terms & Conditions ID
 *         content:
 *           type: string
 *           description: HTML content of the terms & conditions
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TermsConditionRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the terms & conditions
 *     TermsConditionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/TermsCondition'
 */

/**
 * @swagger
 * /v1/api/terms-conditions:
 *   get:
 *     summary: Get terms & conditions
 *     description: Retrieve the current terms & conditions content. Public endpoint.
 *     tags: [Terms & Conditions]
 *     responses:
 *       200:
 *         description: Terms & conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermsConditionResponse'
 */
// Get privacy policy (public)
router.get('/', getTermsCondition);

/**
 * @swagger
 * /v1/api/terms-conditions:
 *   put:
 *     summary: Update terms & conditions
 *     description: Update the terms & conditions content. Admin only.
 *     tags: [Terms & Conditions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsConditionRequest'
 *           example:
 *             content: "<h1>Terms & Conditions</h1><p>Updated T&C content...</p>"
 *     responses:
 *       200:
 *         description: Terms & conditions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermsConditionResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
// Update privacy policy (admin only)
router.put('/', auth('admin'), updateTermsCondition);

export const TermsConditionRouter = router;