import express from 'express'
import { auth } from '../../middlewares/authMiddleware'
import {
  createInclude,
  getIncludes,
  getIncludeById,
  updateInclude,
  deleteInclude,
  toggleIncludeStatus,
} from './subscription-include.controller'

const router = express.Router()

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
router.get('/', getIncludes)

/**
 * @swagger
 * /v1/api/subscription-includes:
 *   post:
 *     summary: Create a new include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth('admin'), createInclude)

/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   get:
 *     summary: Get include by ID
 *     tags: [SubscriptionIncludes]
 */
router.get('/:id', getIncludeById)

/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   put:
 *     summary: Update include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth('admin'), updateInclude)

/**
 * @swagger
 * /v1/api/subscription-includes/{id}:
 *   delete:
 *     summary: Soft delete include
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth('admin'), deleteInclude)

/**
 * @swagger
 * /v1/api/subscription-includes/{id}/toggle:
 *   patch:
 *     summary: Toggle include active status
 *     tags: [SubscriptionIncludes]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/toggle', auth('admin'), toggleIncludeStatus)

export const subscriptionIncludeRouter = router
