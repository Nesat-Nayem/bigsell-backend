/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           description: Product details
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
 *               example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *             thumbnail:
 *               type: string
 *               example: "https://example.com/thumbnail.jpg"
 *             brand:
 *               type: string
 *               example: "Apple"
 *             category:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *                 name:
 *                   type: string
 *                   example: "Smartphones"
 *             status:
 *               type: string
 *               example: "active"
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: Date when item was added to wishlist
 *           example: "2024-01-15T10:30:00Z"
 *         notes:
 *           type: string
 *           description: User notes for this wishlist item
 *           example: "Want to buy during next sale"
 * 
 *     Wishlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Wishlist ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         user:
 *           type: string
 *           description: User ID who owns the wishlist
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WishlistItem'
 *         totalItems:
 *           type: integer
 *           description: Total number of items in wishlist
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Wishlist creation timestamp
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Wishlist update timestamp
 *           example: "2024-01-15T10:30:00Z"
 * 
 *     AddToWishlistRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID to add to wishlist
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Optional notes for this wishlist item
 *           example: "Want to buy during next sale"
 * 
 *     UpdateWishlistItemRequest:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Updated notes for this wishlist item
 *           example: "Changed my mind, want to buy immediately"
 * 
 *     WishlistSummary:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *           description: Total number of items in wishlist
 *           example: 15
 *         recentlyAdded:
 *           type: integer
 *           description: Number of items added in last 7 days
 *           example: 3
 *         categories:
 *           type: array
 *           description: Breakdown of items by category
 *           items:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *               categoryName:
 *                 type: string
 *                 example: "Smartphones"
 *               itemCount:
 *                 type: integer
 *                 example: 5
 *         priceRange:
 *           type: object
 *           description: Price range statistics of wishlist items
 *           properties:
 *             min:
 *               type: number
 *               description: Minimum price in wishlist
 *               example: 299.99
 *             max:
 *               type: number
 *               description: Maximum price in wishlist
 *               example: 1199.99
 *             average:
 *               type: number
 *               description: Average price of wishlist items
 *               example: 649.99
 * 
 *     WishlistResponse:
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
 *           example: "Wishlist retrieved successfully"
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 15
 *             totalPages:
 *               type: integer
 *               example: 2
 *         data:
 *           $ref: '#/components/schemas/Wishlist'
 */

export const WishlistSchemas = {};
