"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_category_controller_1 = require("./product-category.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/productsCategory:
 *   post:
 *     summary: Create a new category
 *     tags: [Product Categories]
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
router.post("/", (0, authMiddleware_1.auth)("admin", "vendor"), cloudinary_1.upload.single("image"), product_category_controller_1.createCategory);
/**
 * @swagger
 * /v1/api/productsCategory:
 *   get:
 *     summary: Get all categories
 *     tags: [Product Categories]
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
router.get("/", product_category_controller_1.getAllCategories);
// Static routes - must come before parameterized routes
/**
 * @swagger
 * /v1/api/productsCategory/tree:
 *   get:
 *     summary: Get category tree (hierarchical structure)
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Parent category ID (optional)
 *       - in: query
 *         name: maxDepth
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Maximum depth to retrieve
 *     responses:
 *       200:
 *         description: Category tree retrieved successfully
 */
router.get("/tree", product_category_controller_1.getCategoryTree);
/**
 * @swagger
 * /v1/api/productsCategory/root:
 *   get:
 *     summary: Get root categories (level 0)
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Root categories retrieved successfully
 */
router.get("/root", product_category_controller_1.getRootCategories);
/**
 * @swagger
 * /v1/api/productsCategory/parent/{parentId}:
 *   get:
 *     summary: Get categories by parent ID
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent category ID (use 'null' for root categories)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/parent/:parentId", product_category_controller_1.getCategoriesByParent);
/**
 * @swagger
 * /v1/api/productsCategory/{id}/breadcrumbs:
 *   get:
 *     summary: Get category breadcrumbs (ancestors)
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category breadcrumbs retrieved successfully
 */
router.get("/:id/breadcrumbs", product_category_controller_1.getCategoryBreadcrumbs);
/**
 * @swagger
 * /v1/api/productsCategory/search:
 *   get:
 *     summary: Search categories
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         description: Category level filter
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Parent category ID filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search completed successfully
 */
router.get("/search", product_category_controller_1.searchCategories);
// Template routes
/**
 * @swagger
 * /v1/api/productsCategory/templates:
 *   get:
 *     summary: Get available category templates
 *     tags: [Product Categories]
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get("/templates", product_category_controller_1.getCategoryTemplates);
/**
 * @swagger
 * /v1/api/productsCategory/templates/create:
 *   post:
 *     summary: Create category from template
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Parent category ID (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryType
 *             properties:
 *               categoryType:
 *                 type: string
 *                 enum: [fashion, electronics, furniture, books, sports, home, beauty, automotive]
 *                 example: "fashion"
 *               includeDefaultAttributes:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Category created from template successfully
 */
router.post("/templates/create", (0, authMiddleware_1.auth)("admin", "vendor"), product_category_controller_1.createCategoryFromTemplate);
/**
 * @swagger
 * /v1/api/productsCategory/templates/fashion-structure:
 *   post:
 *     summary: Create complete fashion category structure
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Fashion category structure created successfully
 */
router.post("/templates/fashion-structure", (0, authMiddleware_1.auth)("admin"), product_category_controller_1.createFashionCategoryStructure);
/**
 * @swagger
 * /v1/api/productsCategory/templates/comprehensive-structure:
 *   post:
 *     summary: Create comprehensive e-commerce category structure (Myntra-like)
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Comprehensive category structure created successfully
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
 *                   example: "Comprehensive category structure created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCategoriesCreated:
 *                       type: integer
 *                       example: 150
 *                     message:
 *                       type: string
 *                       example: "Created complete e-commerce category structure similar to Myntra"
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           level:
 *                             type: integer
 *                           path:
 *                             type: string
 */
router.post("/templates/comprehensive-structure", (0, authMiddleware_1.auth)("admin"), product_category_controller_1.createComprehensiveCategoryStructure);
/**
 * @swagger
 * /v1/api/productsCategory/templates/custom-structure:
 *   post:
 *     summary: Create custom category structure
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     attributes:
 *                       type: array
 *                     children:
 *                       type: array
 *     responses:
 *       201:
 *         description: Custom category structure created successfully
 */
router.post("/templates/custom-structure", (0, authMiddleware_1.auth)("admin"), product_category_controller_1.createCustomCategoryStructure);
// Parameterized routes - must come after static routes
/**
 * @swagger
 * /v1/api/productsCategory/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Product Categories]
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
router.get("/:id", product_category_controller_1.getCategoryById);
/**
 * @swagger
 * /v1/api/productsCategory/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Product Categories]
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
router.put("/:id", (0, authMiddleware_1.auth)("admin", "vendor"), cloudinary_1.upload.single("image"), product_category_controller_1.updateCategoryById);
// Partial update (e.g., toggle status)
router.patch("/:id", (0, authMiddleware_1.auth)("admin", "vendor"), product_category_controller_1.updateCategoryById);
/**
 * @swagger
 * /v1/api/productsCategory/{id}:
 *   delete:
 *     summary: Delete a category by ID (soft delete)
 *     tags: [Product Categories]
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
router.delete("/:id", (0, authMiddleware_1.auth)("admin", "vendor"), product_category_controller_1.deleteCategoryById);
/**
 * @swagger
 * /v1/api/productsCategory/{id}/breadcrumbs:
 *   get:
 *     summary: Get category breadcrumbs (ancestors)
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category breadcrumbs retrieved successfully
 */
router.get("/:id/breadcrumbs", product_category_controller_1.getCategoryBreadcrumbs);
exports.productCategoryRouter = router;
