/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "iPhone 15 Pro Max"
 *         description:
 *           type: string
 *           description: Product description
 *           example: "Latest iPhone with advanced features and premium design"
 *         shortDescription:
 *           type: string
 *           description: Short product description
 *           example: "Premium smartphone with Pro camera system"
 *         price:
 *           type: number
 *           description: Product price
 *           example: 1199.99
 *         originalPrice:
 *           type: number
 *           description: Original price before discount
 *           example: 1299.99
 *         discount:
 *           type: number
 *           description: Discount amount or percentage
 *           example: 10
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Type of discount
 *           example: "percentage"
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit
 *           example: "IPH15PM-256-BLU"
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *           description: Product category
 *         subcategory:
 *           type: string
 *           description: Product subcategory
 *           example: "Smartphones"
 *         brand:
 *           type: string
 *           description: Product brand
 *           example: "Apple"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Product images
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         thumbnail:
 *           type: string
 *           description: Product thumbnail image
 *           example: "https://example.com/thumbnail.jpg"
 *         stock:
 *           type: number
 *           description: Available stock quantity
 *           example: 50
 *         minStock:
 *           type: number
 *           description: Minimum stock threshold
 *           example: 5
 *         weight:
 *           type: number
 *           description: Product weight in grams
 *           example: 221
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *           description: Product dimensions
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Blue", "Black", "White"]
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           description: Available sizes
 *           example: ["128GB", "256GB", "512GB"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *           example: ["smartphone", "apple", "premium"]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Product features
 *           example: ["Face ID", "Wireless Charging", "Water Resistant"]
 *         specifications:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Product specifications
 *           example: {"Display": "6.7-inch Super Retina XDR", "Chip": "A17 Pro"}
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Average product rating
 *           example: 4.5
 *         reviewCount:
 *           type: number
 *           description: Number of reviews
 *           example: 128
 *         status:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *           description: Product status
 *           example: "active"
 *         isFeatured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: true
 *         isTrending:
 *           type: boolean
 *           description: Whether product is trending
 *           example: false
 *         isNewArrival:
 *           type: boolean
 *           description: Whether product is new arrival
 *           example: true
 *         isDiscount:
 *           type: boolean
 *           description: Whether product is in discount group
 *           example: false
 *         isWeeklyBestSelling:
 *           type: boolean
 *           description: Whether product is marked as weekly best selling
 *           example: false
 *         isWeeklyDiscount:
 *           type: boolean
 *           description: Whether product is marked for weekly discount
 *           example: false
 *         seoTitle:
 *           type: string
 *           description: SEO title
 *           example: "iPhone 15 Pro Max - Buy Online"
 *         seoDescription:
 *           type: string
 *           description: SEO description
 *           example: "Get the latest iPhone 15 Pro Max with free shipping"
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 *           description: SEO keywords
 *           example: ["iphone", "smartphone", "apple"]
 *         vendor:
 *           type: string
 *           description: Vendor ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         shippingInfo:
 *           type: object
 *           properties:
 *             weight:
 *               type: number
 *             freeShipping:
 *               type: boolean
 *             shippingCost:
 *               type: number
 *             estimatedDelivery:
 *               type: string
 *           description: Shipping information
 *         finalPrice:
 *           type: number
 *           description: Final price after discount
 *           example: 1079.99
 *         stockStatus:
 *           type: string
 *           enum: [in_stock, low_stock, out_of_stock]
 *           description: Stock status
 *           example: "in_stock"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - sku
 *         - category
 *         - images
 *         - thumbnail
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *           example: "iPhone 15 Pro Max"
 *         description:
 *           type: string
 *           description: Product description
 *           example: "Latest iPhone with advanced features and premium design"
 *         shortDescription:
 *           type: string
 *           description: Short product description
 *           example: "Premium smartphone with Pro camera system"
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *           example: 1199.99
 *         originalPrice:
 *           type: number
 *           minimum: 0
 *           description: Original price before discount
 *           example: 1299.99
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount amount or percentage
 *           example: 10
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Type of discount
 *           example: "percentage"
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit (must be unique)
 *           example: "IPH15PM-256-BLU"
 *         category:
 *           type: string
 *           description: Category ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         subcategory:
 *           type: string
 *           description: Product subcategory
 *           example: "Smartphones"
 *         brand:
 *           type: string
 *           description: Product brand
 *           example: "Apple"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           minItems: 1
 *           description: Product images (at least one required)
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         thumbnail:
 *           type: string
 *           format: uri
 *           description: Product thumbnail image
 *           example: "https://example.com/thumbnail.jpg"
 *         stock:
 *           type: number
 *           minimum: 0
 *           description: Available stock quantity
 *           example: 50
 *         minStock:
 *           type: number
 *           minimum: 0
 *           description: Minimum stock threshold
 *           example: 5
 *         weight:
 *           type: number
 *           minimum: 0
 *           description: Product weight in grams
 *           example: 221
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *               minimum: 0
 *             width:
 *               type: number
 *               minimum: 0
 *             height:
 *               type: number
 *               minimum: 0
 *           description: Product dimensions
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Blue", "Black", "White"]
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           description: Available sizes
 *           example: ["128GB", "256GB", "512GB"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *           example: ["smartphone", "apple", "premium"]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Product features
 *           example: ["Face ID", "Wireless Charging", "Water Resistant"]
 *         specifications:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Product specifications
 *           example: {"Display": "6.7-inch Super Retina XDR", "Chip": "A17 Pro"}
 *         status:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *           description: Product status
 *           example: "active"
 *         isFeatured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: true
 *         isTrending:
 *           type: boolean
 *           description: Whether product is trending
 *           example: false
 *         isNewArrival:
 *           type: boolean
 *           description: Whether product is new arrival
 *           example: true
 *         isDiscount:
 *           type: boolean
 *           description: Whether product is in discount group
 *           example: false
 *         isWeeklyBestSelling:
 *           type: boolean
 *           description: Whether product is marked as weekly best selling
 *           example: false
 *         isWeeklyDiscount:
 *           type: boolean
 *           description: Whether product is marked for weekly discount
 *           example: false
 *         seoTitle:
 *           type: string
 *           maxLength: 60
 *           description: SEO title
 *           example: "iPhone 15 Pro Max - Buy Online"
 *         seoDescription:
 *           type: string
 *           maxLength: 160
 *           description: SEO description
 *           example: "Get the latest iPhone 15 Pro Max with free shipping"
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 *           description: SEO keywords
 *           example: ["iphone", "smartphone", "apple"]
 *         vendor:
 *           type: string
 *           description: Vendor ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         shippingInfo:
 *           type: object
 *           properties:
 *             weight:
 *               type: number
 *               minimum: 0
 *             freeShipping:
 *               type: boolean
 *             shippingCost:
 *               type: number
 *               minimum: 0
 *             estimatedDelivery:
 *               type: string
 *           description: Shipping information
 *     
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *           example: "iPhone 15 Pro Max"
 *         description:
 *           type: string
 *           description: Product description
 *           example: "Latest iPhone with advanced features and premium design"
 *         shortDescription:
 *           type: string
 *           description: Short product description
 *           example: "Premium smartphone with Pro camera system"
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Product price
 *           example: 1199.99
 *         originalPrice:
 *           type: number
 *           minimum: 0
 *           description: Original price before discount
 *           example: 1299.99
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount amount or percentage
 *           example: 10
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Type of discount
 *           example: "percentage"
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit (must be unique)
 *           example: "IPH15PM-256-BLU"
 *         category:
 *           type: string
 *           description: Category ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         subcategory:
 *           type: string
 *           description: Product subcategory
 *           example: "Smartphones"
 *         brand:
 *           type: string
 *           description: Product brand
 *           example: "Apple"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           minItems: 1
 *           description: Product images (at least one required)
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         thumbnail:
 *           type: string
 *           format: uri
 *           description: Product thumbnail image
 *           example: "https://example.com/thumbnail.jpg"
 *         stock:
 *           type: number
 *           minimum: 0
 *           description: Available stock quantity
 *           example: 50
 *         minStock:
 *           type: number
 *           minimum: 0
 *           description: Minimum stock threshold
 *           example: 5
 *         weight:
 *           type: number
 *           minimum: 0
 *           description: Product weight in grams
 *           example: 221
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *               minimum: 0
 *             width:
 *               type: number
 *               minimum: 0
 *             height:
 *               type: number
 *               minimum: 0
 *           description: Product dimensions
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Available colors
 *           example: ["Blue", "Black", "White"]
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           description: Available sizes
 *           example: ["128GB", "256GB", "512GB"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *           example: ["smartphone", "apple", "premium"]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Product features
 *           example: ["Face ID", "Wireless Charging", "Water Resistant"]
 *         specifications:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Product specifications
 *           example: {"Display": "6.7-inch Super Retina XDR", "Chip": "A17 Pro"}
 *         status:
 *           type: string
 *           enum: [active, inactive, out_of_stock, discontinued]
 *           description: Product status
 *           example: "active"
 *         isFeatured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: true
 *         isTrending:
 *           type: boolean
 *           description: Whether product is trending
 *           example: false
 *         isNewArrival:
 *           type: boolean
 *           description: Whether product is new arrival
 *           example: true
 *         isDiscount:
 *           type: boolean
 *           description: Whether product is in discount group
 *           example: false
 *         isWeeklyBestSelling:
 *           type: boolean
 *           description: Whether product is marked as weekly best selling
 *           example: false
 *         isWeeklyDiscount:
 *           type: boolean
 *           description: Whether product is marked for weekly discount
 *           example: false
 *         seoTitle:
 *           type: string
 *           maxLength: 60
 *           description: SEO title
 *           example: "iPhone 15 Pro Max - Buy Online"
 *         seoDescription:
 *           type: string
 *           maxLength: 160
 *           description: SEO description
 *           example: "Get the latest iPhone 15 Pro Max with free shipping"
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 *           description: SEO keywords
 *           example: ["iphone", "smartphone", "apple"]
 *         vendor:
 *           type: string
 *           description: Vendor ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         shippingInfo:
 *           type: object
 *           properties:
 *             weight:
 *               type: number
 *               minimum: 0
 *             freeShipping:
 *               type: boolean
 *             shippingCost:
 *               type: number
 *               minimum: 0
 *             estimatedDelivery:
 *               type: string
 *           description: Shipping information
 *     
 *     ProductResponse:
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
 *           example: "Product retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Product'
 *     
 *     ProductsResponse:
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
 *           example: "Products retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *     
 *     ProductsListResponse:
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
 *           example: "Products retrieved successfully"
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
 *               example: 100
 *             totalPages:
 *               type: integer
 *               example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *     
 *     ProductFiltersResponse:
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
 *           example: "Product filters retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             brands:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Apple", "Samsung", "Google"]
 *             colors:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Black", "White", "Blue", "Red"]
 *             sizes:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["128GB", "256GB", "512GB"]
 *             priceRange:
 *               type: object
 *               properties:
 *                 minPrice:
 *                   type: number
 *                   example: 99.99
 *                 maxPrice:
 *                   type: number
 *                   example: 1999.99
 */

// This file contains all product-related Swagger schemas
// It's automatically picked up by swagger-jsdoc when scanning the product module
export {};
