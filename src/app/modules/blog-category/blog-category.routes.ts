import express from 'express';
import { createBlogCategory, deleteBlogCategory, getBlogCategories, getBlogCategoryById, updateBlogCategory } from './blog-category.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         categoryName:
 *           type: string
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
 *     BlogCategoryCreate:
 *       type: object
 *       required: [categoryName]
 *       properties:
 *         categoryName:
 *           type: string
 *           example: News
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           example: Active
 *     BlogCategoryUpdate:
 *       type: object
 *       properties:
 *         categoryName:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *     BlogCategoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/BlogCategory'
 *     BlogCategoryListResponse:
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
 *             $ref: '#/components/schemas/BlogCategory'
 */

/**
 * @swagger
 * /v1/api/blog-categories:
 *   post:
 *     summary: Create a blog category
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogCategoryCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogCategoryResponse'
 */
router.post('/', auth('admin'), createBlogCategory);

/**
 * @swagger
 * /v1/api/blog-categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Blog Categories]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogCategoryListResponse'
 */
router.get('/', getBlogCategories);

/**
 * @swagger
 * /v1/api/blog-categories/{id}:
 *   get:
 *     summary: Get a blog category by ID
 *     tags: [Blog Categories]
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
 *               $ref: '#/components/schemas/BlogCategoryResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', getBlogCategoryById);

/**
 * @swagger
 * /v1/api/blog-categories/{id}:
 *   put:
 *     summary: Update a blog category
 *     tags: [Blog Categories]
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
 *             $ref: '#/components/schemas/BlogCategoryUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogCategoryResponse'
 */
router.put('/:id', auth('admin'), updateBlogCategory);

/**
 * @swagger
 * /v1/api/blog-categories/{id}:
 *   delete:
 *     summary: Delete a blog category
 *     tags: [Blog Categories]
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
 *               $ref: '#/components/schemas/BlogCategoryResponse'
 */
router.delete('/:id', auth('admin'), deleteBlogCategory);

export const blogCategoryRouter = router;
