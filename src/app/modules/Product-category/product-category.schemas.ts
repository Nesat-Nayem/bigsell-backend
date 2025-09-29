/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Category unique identifier
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         title:
 *           type: string
 *           description: Category title
 *           example: "Electronics"
 *         image:
 *           type: string
 *           description: Category image URL
 *           example: "https://res.cloudinary.com/example/image/upload/v1234567890/categories/electronics.jpg"
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete flag
 *           example: false
 *         createdAt:
 *           type: string
 *           description: Category creation timestamp
 *           example: "2024-01-15 10:30:45"
 *         updatedAt:
 *           type: string
 *           description: Category last update timestamp
 *           example: "2024-01-15 10:30:45"
 *       required:
 *         - _id
 *         - title
 *         - image
 *         - isDeleted
 *         - createdAt
 *         - updatedAt
 *
 *     CreateCategoryRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Category title
 *           example: "Electronics"
 *         image:
 *           type: string
 *           format: binary
 *           description: Category image file
 *       required:
 *         - title
 *         - image
 *
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Category title
 *           example: "Updated Electronics"
 *         image:
 *           type: string
 *           format: binary
 *           description: Category image file (optional)
 *
 *     CategoryResponse:
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
 *           example: "Category retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Category'
 *
 *     CategoriesListResponse:
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
 *           example: "Categories retrieved successfully"
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
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *
 *     CategoryDeleteResponse:
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
 *           example: "Category deleted successfully"
 */

// This file contains Swagger schema definitions for Category-related API endpoints.
// It's automatically picked up by swagger-jsdoc when scanning the category module.
export {};
