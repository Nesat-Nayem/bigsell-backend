"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingPolicyRouter = void 0;
const express_1 = __importDefault(require("express"));
const shipping_policy_controller_1 = require("./shipping-policy.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingPolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Shipping policy ID
 *         content:
 *           type: string
 *           description: HTML content of the shipping policy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     ShippingPolicyRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: HTML content of the shipping policy
 *     ShippingPolicyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ShippingPolicy'
 */
/**
 * @swagger
 * /v1/api/shipping-policy:
 *   get:
 *     summary: Get shipping policy
 *     description: Retrieve the current shipping policy content. This is a public endpoint that doesn't require authentication.
 *     tags: [Shipping Policy]
 *     responses:
 *       200:
 *         description: Shipping policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShippingPolicyResponse'
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
// Get shipping policy (public)
router.get('/', shipping_policy_controller_1.getShippingPolicy);
/**
 * @swagger
 * /v1/api/shipping-policy:
 *   put:
 *     summary: Update shipping policy
 *     description: Update the shipping policy content. This endpoint requires admin authentication.
 *     tags: [Shipping Policy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShippingPolicyRequest'
 *           example:
 *             content: "<h1>Shipping Policy</h1><p>Updated shipping policy content...</p>"
 *     responses:
 *       200:
 *         description: Shipping policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShippingPolicyResponse'
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
// Update shipping policy (admin only)
router.put('/', (0, authMiddleware_1.auth)('admin'), shipping_policy_controller_1.updateShippingPolicy);
exports.shippingPolicyRouter = router;
