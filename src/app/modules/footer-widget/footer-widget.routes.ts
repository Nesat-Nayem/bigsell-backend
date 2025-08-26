import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import {
  createFooterWidget,
  getAllFooterWidgets,
  getFooterWidgetById,
  updateFooterWidgetById,
  deleteFooterWidgetById,
} from './footer-widget.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FooterWidget:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         subtitle: { type: string }
 *         isDeleted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       example:
 *         _id: "66d0b3e2aa11bb22cc33dd44"
 *         title: "Customer Service"
 *         subtitle: "Help Center, Returns, Warranty"
 *         isDeleted: false
 *         createdAt: "2025-08-26 10:45:00"
 *         updatedAt: "2025-08-26 10:45:00"
 *     FooterWidgetResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/FooterWidget'
 *     FooterWidgetListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FooterWidget'
 */

/**
 * @swagger
 * /v1/api/footer-widgets:
 *   get:
 *     summary: Get all footer widgets
 *     tags: [Footer Widgets]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterWidgetListResponse'
 */
router.get('/', getAllFooterWidgets);

/**
 * @swagger
 * /v1/api/footer-widgets/{id}:
 *   get:
 *     summary: Get a footer widget by ID
 *     tags: [Footer Widgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterWidgetResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', getFooterWidgetById);

/**
 * @swagger
 * /v1/api/footer-widgets:
 *   post:
 *     summary: Create a footer widget
 *     tags: [Footer Widgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, subtitle]
 *             properties:
 *               title: { type: string }
 *               subtitle: { type: string }
 *           examples:
 *             Default:
 *               summary: Create footer widget
 *               value:
 *                 title: "Customer Service"
 *                 subtitle: "Help Center, Returns, Warranty"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterWidgetResponse'
 */
router.post('/', auth('admin'), createFooterWidget);

/**
 * @swagger
 * /v1/api/footer-widgets/{id}:
 *   put:
 *     summary: Update a footer widget
 *     tags: [Footer Widgets]
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
 *             type: object
 *             properties:
 *               title: { type: string }
 *               subtitle: { type: string }
 *           examples:
 *             TextOnly:
 *               summary: Update fields
 *               value:
 *                 title: "Support"
 *                 subtitle: "FAQ, Track Order, Contact Us"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterWidgetResponse'
 */
router.put('/:id', auth('admin'), updateFooterWidgetById);

/**
 * @swagger
 * /v1/api/footer-widgets/{id}:
 *   delete:
 *     summary: Delete a footer widget
 *     tags: [Footer Widgets]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterWidgetResponse'
 */
router.delete('/:id', auth('admin'), deleteFooterWidgetById);

export const footerWidgetRouter = router;
