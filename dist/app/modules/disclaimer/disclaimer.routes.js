"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disclaimerRouter = void 0;
const express_1 = __importDefault(require("express"));
const disclaimer_controller_1 = require("./disclaimer.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.get('/', disclaimer_controller_1.getDisclaimer);
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
router.put('/', (0, authMiddleware_1.auth)('admin'), disclaimer_controller_1.updateDisclaimer);
exports.disclaimerRouter = router;
