"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionIncludeRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const subscription_include_controller_1 = require("./subscription-include.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: SubscriptionIncludes
 *   description: Manage reusable plan includes
 */
/**
 * @swagger
 * /v1/api/subscription-includes:
 *   get:
 *     summary: List includes with optional search and pagination
 *     tags: [SubscriptionIncludes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', subscription_include_controller_1.getIncludes);
/**
 * @swagger
 * /v1/api/subscription-includes:
 *   post:
 *     summary: Create a new include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), subscription_include_controller_1.createInclude);
/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   get:
 *     summary: Get include by ID
 *     tags: [SubscriptionIncludes]
 */
router.get('/:id', subscription_include_controller_1.getIncludeById);
/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   put:
 *     summary: Update include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), subscription_include_controller_1.updateInclude);
/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   delete:
 *     summary: Soft delete include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), subscription_include_controller_1.deleteInclude);
/**
 * @swagger
 * /v1/api/subscription-includes/{id}/toggle:
 *   patch:
 *     summary: Toggle include active status
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/toggle', (0, authMiddleware_1.auth)('admin'), subscription_include_controller_1.toggleIncludeStatus);
exports.subscriptionIncludeRouter = router;
