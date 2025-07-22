"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
const express_1 = __importDefault(require("express"));
const wishlist_controller_1 = require("./wishlist.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /v1/api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-addedAt"
 *         description: Sort field and order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID or name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name, description, brand, or notes
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', (0, authMiddleware_1.auth)(), wishlist_controller_1.getWishlist);
/**
 * @swagger
 * /v1/api/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToWishlistRequest'
 *     responses:
 *       200:
 *         description: Item added to wishlist successfully
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
 *                   example: "Item added to wishlist successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Bad request (invalid product ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or inactive
 */
router.post('/', (0, authMiddleware_1.auth)(), wishlist_controller_1.addToWishlist);
/**
 * @swagger
 * /v1/api/wishlist/{productId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove from wishlist
 *     responses:
 *       200:
 *         description: Item removed from wishlist successfully
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
 *                   example: "Item removed from wishlist successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Bad request (invalid product ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist or item not found
 */
router.delete('/:productId', (0, authMiddleware_1.auth)(), wishlist_controller_1.removeFromWishlist);
/**
 * @swagger
 * /v1/api/wishlist/{productId}:
 *   put:
 *     summary: Update wishlist item notes
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update notes for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWishlistItemRequest'
 *     responses:
 *       200:
 *         description: Wishlist item updated successfully
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
 *                   example: "Wishlist item updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Bad request (invalid product ID)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist or item not found
 */
router.put('/:productId', (0, authMiddleware_1.auth)(), wishlist_controller_1.updateWishlistItem);
/**
 * @swagger
 * /v1/api/wishlist/clear:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
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
 *                   example: "Wishlist cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *                     user:
 *                       type: string
 *                       example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *                     items:
 *                       type: array
 *                       items: {}
 *                       example: []
 *                     totalItems:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist not found
 */
router.delete('/clear', (0, authMiddleware_1.auth)(), wishlist_controller_1.clearWishlist);
/**
 * @swagger
 * /v1/api/wishlist/check/{productId}:
 *   get:
 *     summary: Check if item is in wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to check in wishlist
 *     responses:
 *       200:
 *         description: Wishlist check completed
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
 *                   example: "Wishlist check completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *                     isInWishlist:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request (invalid product ID)
 *       401:
 *         description: Unauthorized
 */
router.get('/check/:productId', (0, authMiddleware_1.auth)(), wishlist_controller_1.checkItemInWishlist);
/**
 * @swagger
 * /v1/api/wishlist/summary:
 *   get:
 *     summary: Get wishlist summary and statistics
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist summary retrieved successfully
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
 *                   example: "Wishlist summary retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/WishlistSummary'
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', (0, authMiddleware_1.auth)(), wishlist_controller_1.getWishlistSummary);
exports.wishlistRouter = router;
