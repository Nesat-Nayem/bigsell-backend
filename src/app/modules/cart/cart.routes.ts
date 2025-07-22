import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
} from './cart.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /v1/api/cart:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Whether to populate product details
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: "Cart retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth('user'), getCart);

/**
 * @swagger
 * /v1/api/cart/add:
 *   post:
 *     summary: Add item to shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add to cart
 *                 example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Quantity of the product
 *                 example: 2
 *               selectedColor:
 *                 type: string
 *                 description: Selected color variant (optional)
 *                 example: "Red"
 *               selectedSize:
 *                 type: string
 *                 description: Selected size variant (optional)
 *                 example: "Large"
 *     responses:
 *       200:
 *         description: Item added to cart successfully
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
 *                   example: "Item added to cart successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request (invalid product, insufficient stock, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/add', auth('user'), addToCart);

/**
 * @swagger
 * /v1/api/cart/item/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: New quantity for the product
 *                 example: 3
 *               selectedColor:
 *                 type: string
 *                 description: Selected color variant (optional)
 *                 example: "Red"
 *               selectedSize:
 *                 type: string
 *                 description: Selected size variant (optional)
 *                 example: "Large"
 *     responses:
 *       200:
 *         description: Cart item updated successfully
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
 *                   example: "Cart item updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request (insufficient stock, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or item not found
 */
router.put('/item/:productId', auth('user'), updateCartItem);

/**
 * @swagger
 * /v1/api/cart/item/{productId}:
 *   delete:
 *     summary: Remove item from shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *       - in: query
 *         name: selectedColor
 *         schema:
 *           type: string
 *         description: Selected color variant (optional)
 *       - in: query
 *         name: selectedSize
 *         schema:
 *           type: string
 *         description: Selected size variant (optional)
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
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
 *                   example: "Item removed from cart successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */
router.delete('/item/:productId', auth('user'), removeFromCart);

/**
 * @swagger
 * /v1/api/cart/clear:
 *   delete:
 *     summary: Clear entire shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
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
 *                   example: "Cart cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
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
 *                     totalPrice:
 *                       type: number
 *                       example: 0
 *                     itemCount:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */
router.delete('/clear', auth('user'), clearCart);

/**
 * @swagger
 * /v1/api/cart/summary:
 *   get:
 *     summary: Get cart summary (lightweight)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart summary retrieved successfully
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
 *                   example: "Cart summary retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CartSummary'
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', auth('user'), getCartSummary);

export const cartRouter = router;
