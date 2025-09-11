"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), product_controller_1.createProduct);
/**
 * @swagger
 * /v1/api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
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
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *           default: active
 *         description: Filter by product status
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *       - in: query
 *         name: isTrending
 *         schema:
 *           type: boolean
 *         description: Filter trending products
 *       - in: query
 *         name: isNewArrival
 *         schema:
 *           type: boolean
 *         description: Filter new arrival products
 *       - in: query
 *         name: isDiscount
 *         schema:
 *           type: boolean
 *         description: Filter discount products
 *       - in: query
 *         name: isWeeklyBestSelling
 *         schema:
 *           type: boolean
 *         description: Filter weekly best selling products
 *       - in: query
 *         name: isWeeklyDiscount
 *         schema:
 *           type: boolean
 *         description: Filter weekly discount products
 *       - in: query
 *         name: colors
 *         schema:
 *           type: string
 *         description: Filter by colors (comma-separated)
 *       - in: query
 *         name: sizes
 *         schema:
 *           type: string
 *         description: Filter by sizes (comma-separated)
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name, description, and tags
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 */
router.get('/', product_controller_1.getAllProducts);
/**
 * @swagger
 * /v1/api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 *       400:
 *         description: Search query is required
 */
router.get('/search', product_controller_1.searchProducts);
/**
 * @swagger
 * /v1/api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/featured', product_controller_1.getFeaturedProducts);
/**
 * @swagger
 * /v1/api/products/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Trending products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/trending', product_controller_1.getTrendingProducts);
/**
 * @swagger
 * /v1/api/products/new-arrivals:
 *   get:
 *     summary: Get new arrival products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: New arrival products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/new-arrivals', product_controller_1.getNewArrivalProducts);
/**
 * @swagger
 * /v1/api/products/discount:
 *   get:
 *     summary: Get discount products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Discount products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/discount', product_controller_1.getDiscountProducts);
/**
 * @swagger
 * /v1/api/products/weekly-best-selling:
 *   get:
 *     summary: Get weekly best selling products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Weekly best selling products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/weekly-best-selling', product_controller_1.getWeeklyBestSellingProducts);
/**
 * @swagger
 * /v1/api/products/weekly-discount:
 *   get:
 *     summary: Get weekly discount products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Weekly discount products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 */
router.get('/weekly-discount', product_controller_1.getWeeklyDiscountProducts);
/**
 * @swagger
 * /v1/api/products/filters:
 *   get:
 *     summary: Get available product filters
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product filters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductFiltersResponse'
 */
router.get('/filters', product_controller_1.getProductFilters);
// Get product by slug
router.get('/slug/:slug', product_controller_1.getProductBySlug);
/**
 * @swagger
 * /v1/api/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
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
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 *       400:
 *         description: Invalid category ID
 */
router.get('/category/:categoryId', product_controller_1.getProductsByCategory);
/**
 * @swagger
 * /v1/api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/:id', product_controller_1.getProductById);
/**
 * @swagger
 * /v1/api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), product_controller_1.updateProduct);
/**
 * @swagger
 * /v1/api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), product_controller_1.deleteProduct);
exports.productRouter = router;
