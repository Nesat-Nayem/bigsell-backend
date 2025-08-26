import express from 'express';
import { getHelpSupport, updateHelpSupport } from './help-support.controller';
import { auth } from '../../middlewares/authMiddleware';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Help Support
 *     description: Help & Support content management
 */

/**
 * @swagger
 * /v1/api/help-support:
 *   get:
 *     summary: Get help and support content
 *     tags: [Help Support]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
// Get help and support content (public)
router.get('/', getHelpSupport);

/**
 * @swagger
 * /v1/api/help-support:
 *   put:
 *     summary: Update help and support content
 *     tags: [Help Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HelpSupportUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
// Update help and support content (admin only)
router.put('/', auth('admin'), updateHelpSupport);

export const helpSupportRouter = router;