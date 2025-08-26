import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upload } from '../../config/cloudinary';
import {
  createHeaderBanner,
  getAllHeaderBanners,
  getHeaderBannerById,
  updateHeaderBannerById,
  deleteHeaderBannerById,
} from './header-banner.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HeaderBanner:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         image: { type: string, description: 'Image URL' }
 *         isActive: { type: boolean }
 *         order: { type: integer }
 *         isDeleted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     HeaderBannerResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/HeaderBanner'
 *     HeaderBannerListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HeaderBanner'
 */

/**
 * @swagger
 * /v1/api/header-banners:
 *   get:
 *     summary: Get all header banners
 *     tags: [Header Banners]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, returns only active banners
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderBannerListResponse'
 */
router.get('/', getAllHeaderBanners);

/**
 * @swagger
 * /v1/api/header-banners/{id}:
 *   get:
 *     summary: Get a header banner by ID
 *     tags: [Header Banners]
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
 *               $ref: '#/components/schemas/HeaderBannerResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', getHeaderBannerById);

/**
 * @swagger
 * /v1/api/header-banners:
 *   post:
 *     summary: Create a header banner
 *     tags: [Header Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, image]
 *             properties:
 *               title: { type: string }
 *               image: { type: string, format: binary }
 *               isActive: { type: string, enum: [true, false] }
 *               order: { type: integer }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderBannerResponse'
 */
router.post('/', auth('admin'), upload.single('image'), createHeaderBanner);

/**
 * @swagger
 * /v1/api/header-banners/{id}:
 *   put:
 *     summary: Update a header banner
 *     tags: [Header Banners]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               image: { type: string, format: binary }
 *               isActive: { type: string, enum: [true, false] }
 *               order: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderBannerResponse'
 */
router.put('/:id', auth('admin'), upload.single('image'), updateHeaderBannerById);

/**
 * @swagger
 * /v1/api/header-banners/{id}:
 *   delete:
 *     summary: Delete a header banner
 *     tags: [Header Banners]
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
 *               $ref: '#/components/schemas/HeaderBannerResponse'
 */
router.delete('/:id', auth('admin'), deleteHeaderBannerById);

export const headerBannerRouter = router;
