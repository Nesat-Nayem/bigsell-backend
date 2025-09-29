"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 description: Category title
 *                 example: "Electronics"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Category already exists
 */
router.post("/", (0, authMiddleware_1.auth)("admin", "vendor"), cloudinary_1.upload.single("image"), category_controller_1.createCategory);
/**
 * @swagger
 * /v1/api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get("/", category_controller_1.getAllCategories);
/**
 * @swagger
 * /v1/api/categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Category retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get("/:id", category_controller_1.getCategoryById);
/**
 * @swagger
 * /v1/api/categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Category title
 *                 example: "Updated Electronics"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file (optional)
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put("/:id", (0, authMiddleware_1.auth)("admin", "vendor"), cloudinary_1.upload.single("image"), category_controller_1.updateCategoryById);
/**
 * @swagger
 * /v1/api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID (soft delete)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete("/:id", (0, authMiddleware_1.auth)("admin", "vendor"), category_controller_1.deleteCategoryById);
exports.categoryRouter = router;
