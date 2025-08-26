import express from 'express';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from './blog.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { upload } from '../../config/cloudinary';
// import { upload } from '../../config/multer';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         shortDesc:
 *           type: string
 *         longDesc:
 *           type: string
 *         image:
 *           type: string
 *           description: Image URL
 *         category:
 *           type: string
 *           description: Blog category name
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BlogListResponse:
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
 *             $ref: '#/components/schemas/Blog'
 *     BlogResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Blog'
 */

/**
 * @swagger
 * /v1/api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by blog status
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 */
// Public routes
router.get('/', getBlogs);

/**
 * @swagger
 * /v1/api/blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
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
 *               $ref: '#/components/schemas/BlogResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', getBlogById);

// Admin routes
/**
 * @swagger
 * /v1/api/blogs:
 *   post:
 *     summary: Create a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, shortDesc, longDesc, category, image]
 *             properties:
 *               title:
 *                 type: string
 *               shortDesc:
 *                 type: string
 *               longDesc:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 */
router.post('/', auth('admin'), upload.single('image'), createBlog);

/**
 * @swagger
 * /v1/api/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
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
 *               shortDesc:
 *                 type: string
 *               longDesc:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 */
router.put('/:id', auth('admin'), upload.single('image'), updateBlog);

/**
 * @swagger
 * /v1/api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
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
 *               $ref: '#/components/schemas/BlogResponse'
 */
router.delete('/:id', auth('admin'), deleteBlog);

export const blogRouter = router;