import express from 'express';
import { 
  createFAQ, 
  getAllFAQs, 
  getFAQById, 
  updateFAQById, 
  deleteFAQById,
  generateFAQAnswer
} from './faq.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FAQ:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         category:
 *           type: string
 *           nullable: true
 *         order:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     FAQCreate:
 *       type: object
 *       required: [question, answer]
 *       properties:
 *         question:
 *           type: string
 *           example: How do I track my order?
 *         answer:
 *           type: string
 *           example: Go to Orders > Track to see the status.
 *         category:
 *           type: string
 *           example: Orders
 *         order:
 *           type: integer
 *           example: 1
 *         isActive:
 *           type: boolean
 *           example: true
 *     FAQUpdate:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         category:
 *           type: string
 *         order:
 *           type: integer
 *         isActive:
 *           type: boolean
 *     FAQResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/FAQ'
 *     FAQListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FAQ'
 *     FAQGenerateRequest:
 *       type: object
 *       required: [question]
 *       properties:
 *         question:
 *           type: string
 *           example: What is your return policy?
 *     FAQGenerateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             question:
 *               type: string
 *             answer:
 *               type: string
 */

/**
 * @swagger
 * /v1/api/faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQResponse'
 */
// Create a new FAQ (admin only)
router.post('/', auth('admin'), createFAQ);

/**
 * @swagger
 * /v1/api/faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: If true, only return active FAQs
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter FAQs by category
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQListResponse'
 */
// Get all FAQs (public)
router.get('/', getAllFAQs);

/**
 * @swagger
 * /v1/api/faqs/{id}:
 *   get:
 *     summary: Get a FAQ by ID
 *     tags: [FAQs]
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
 *               $ref: '#/components/schemas/FAQResponse'
 *       404:
 *         description: FAQ not found
 */
// Get a single FAQ by ID (public)
router.get('/:id', getFAQById);

/**
 * @swagger
 * /v1/api/faqs/{id}:
 *   put:
 *     summary: Update a FAQ by ID
 *     tags: [FAQs]
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
 *             $ref: '#/components/schemas/FAQUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQResponse'
 *       404:
 *         description: FAQ not found
 */
// Update a FAQ by ID (admin only)
router.put('/:id', auth('admin'), updateFAQById);

/**
 * @swagger
 * /v1/api/faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ by ID
 *     tags: [FAQs]
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
 *               $ref: '#/components/schemas/FAQResponse'
 *       404:
 *         description: FAQ not found
 */
// Delete a FAQ by ID (admin only)
router.delete('/:id', auth('admin'), deleteFAQById);

/**
 * @swagger
 * /v1/api/faqs/generate-answer:
 *   post:
 *     summary: Generate an AI-based answer for a question
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQGenerateRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQGenerateResponse'
 */
// Generate FAQ answer using AI
router.post('/generate-answer', auth('admin'), generateFAQAnswer);

export const faqRouter = router;