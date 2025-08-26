"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsConditionRouter = void 0;
const express_1 = __importDefault(require("express"));
const terms_condition_controller_1 = require("./terms-condition.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.get('/', terms_condition_controller_1.getTermsCondition);
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
router.put('/', (0, authMiddleware_1.auth)('admin'), terms_condition_controller_1.updateTermsCondition);
exports.TermsConditionRouter = router;
