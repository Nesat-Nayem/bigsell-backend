import express from 'express';
import { 
  createBanner, 
  getAllBanners, 
  
  getBannerById, 
  updateBannerById, 
  deleteBannerById 
} from './banner.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         image:
 *           type: string
 *           description: Image URL
 *         isActive:
 *           type: boolean
 *         order:
 *           type: integer
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BannerResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/Banner'
 *     BannerListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Banner'
 */

/**
 * @swagger
 * /v1/api/banners:
 *   get:
 *     summary: Get all banners
 *     tags: [Banners]
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
 *               $ref: '#/components/schemas/BannerListResponse'
 */
// Get all banners (with optional active filter)
router.get('/', getAllBanners);

/**
 * @swagger
 * /v1/api/banners/{id}:
 *   get:
 *     summary: Get a banner by ID
 *     tags: [Banners]
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
 *               $ref: '#/components/schemas/BannerResponse'
 *       404:
 *         description: Not found
 */
// Get a single banner by ID
router.get('/:id', getBannerById);

// Create a new banner with image upload
/**
 * @swagger
 * /v1/api/banners:
 *   post:
 *     summary: Create a banner
 *     tags: [Banners]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               isActive:
 *                 type: string
 *                 enum: [true, false]
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerResponse'
 */
router.post('/', auth('admin'), upload.single('image'), createBanner);

// Update a banner by ID with optional image upload
/**
 * @swagger
 * /v1/api/banners/{id}:
 *   put:
 *     summary: Update a banner
 *     tags: [Banners]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               isActive:
 *                 type: string
 *                 enum: [true, false]
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerResponse'
 */
router.put('/:id', auth('admin'), upload.single('image'), updateBannerById);

// Delete a banner by ID (soft delete)
/**
 * @swagger
 * /v1/api/banners/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags: [Banners]
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
 *               $ref: '#/components/schemas/BannerResponse'
 */
router.delete('/:id', auth('admin'), deleteBannerById);

export const bannerRouter = router;
