"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRouter = void 0;
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("./subscription.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription plans management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         price:
 *           type: number
 *         currency:
 *           type: string
 *           example: INR
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly]
 *         color:
 *           type: string
 *           example: secondary
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         order:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         isDeleted:
 *           type: boolean
 *         metaTitle:
 *           type: string
 *         metaTags:
 *           type: array
 *           items:
 *             type: string
 *         metaDescription:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /v1/api/subscriptions:
 *   post:
 *     summary: Create a new subscription plan (max 3 active allowed)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), subscription_controller_1.createSubscription);
/**
 * @swagger
 * /v1/api/subscriptions:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: If true, only return active plans
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of plans (e.g., 3 for frontend)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name/slug/metaTitle
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', subscription_controller_1.getAllSubscriptions);
/**
 * @swagger
 * /v1/api/subscriptions/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', subscription_controller_1.getSubscriptionById);
/**
 * @swagger
 * /v1/api/subscriptions/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), subscription_controller_1.updateSubscriptionById);
/**
 * @swagger
 * /v1/api/subscriptions/{id}:
 *   delete:
 *     summary: Soft delete a subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), subscription_controller_1.deleteSubscriptionById);
/**
 * @swagger
 * /v1/api/subscriptions/{id}/toggle:
 *   patch:
 *     summary: Toggle subscription active status (enforces max 3 active)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Optional explicit target state
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id/toggle', (0, authMiddleware_1.auth)('admin'), subscription_controller_1.toggleSubscriptionStatus);
exports.subscriptionRouter = router;
