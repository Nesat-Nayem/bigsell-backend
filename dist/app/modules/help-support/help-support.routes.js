"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpSupportRouter = void 0;
const express_1 = __importDefault(require("express"));
const help_support_controller_1 = require("./help-support.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.get('/', help_support_controller_1.getHelpSupport);
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
router.put('/', (0, authMiddleware_1.auth)('admin'), help_support_controller_1.updateHelpSupport);
exports.helpSupportRouter = router;
