/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *             name:
 *               type: string
 *               example: "iPhone 15 Pro Max"
 *             price:
 *               type: number
 *               example: 1199.99
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["https://example.com/image1.jpg"]
 *             thumbnail:
 *               type: string
 *               example: "https://example.com/thumbnail.jpg"
 *             stock:
 *               type: integer
 *               example: 50
 *             colors:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Red", "Blue", "Black"]
 *             sizes:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["128GB", "256GB", "512GB"]
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         price:
 *           type: number
 *           description: Price at the time of adding to cart
 *           example: 1199.99
 *         selectedColor:
 *           type: string
 *           example: "Red"
 *         selectedSize:
 *           type: string
 *           example: "256GB"
 *       required:
 *         - product
 *         - quantity
 *         - price
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Cart unique identifier
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalItems:
 *           type: integer
 *           description: Total quantity of all items
 *           example: 5
 *         totalPrice:
 *           type: number
 *           description: Total price of all items
 *           example: 2399.98
 *         itemCount:
 *           type: integer
 *           description: Number of unique items in cart
 *           example: 2
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           example: "2024-01-15 10:30:45"
 *         updatedAt:
 *           type: string
 *           example: "2024-01-15 10:30:45"
 *       required:
 *         - _id
 *         - user
 *         - items
 *         - totalItems
 *         - totalPrice
 *         - isDeleted
 *         - createdAt
 *         - updatedAt
 *
 *     CartSummary:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *           description: Total quantity of all items
 *           example: 5
 *         totalPrice:
 *           type: number
 *           description: Total price of all items
 *           example: 2399.98
 *         itemCount:
 *           type: integer
 *           description: Number of unique items in cart
 *           example: 2
 *       required:
 *         - totalItems
 *         - totalPrice
 *         - itemCount
 *
 *     AddToCartRequest:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID to add to cart
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Quantity of the product
 *           example: 2
 *         selectedColor:
 *           type: string
 *           description: Selected color variant (optional)
 *           example: "Red"
 *         selectedSize:
 *           type: string
 *           description: Selected size variant (optional)
 *           example: "Large"
 *       required:
 *         - productId
 *         - quantity
 *
 *     UpdateCartItemRequest:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: New quantity for the product
 *           example: 3
 *         selectedColor:
 *           type: string
 *           description: Selected color variant (optional)
 *           example: "Red"
 *         selectedSize:
 *           type: string
 *           description: Selected size variant (optional)
 *           example: "Large"
 *       required:
 *         - quantity
 *
 *     CartResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Cart retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Cart'
 *
 *     CartSummaryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Cart summary retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/CartSummary'
 */

// This file contains Swagger schema definitions for Cart-related API endpoints.
// It's automatically picked up by swagger-jsdoc when scanning the cart module.
export {};
