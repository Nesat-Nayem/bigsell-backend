/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "iPhone 15 Pro Max"
 *         price:
 *           type: number
 *           description: Product price at time of order
 *           example: 1199.99
 *         quantity:
 *           type: integer
 *           description: Quantity ordered
 *           example: 2
 *         selectedColor:
 *           type: string
 *           description: Selected color variant
 *           example: "Blue"
 *         selectedSize:
 *           type: string
 *           description: Selected size variant
 *           example: "256GB"
 *         thumbnail:
 *           type: string
 *           description: Product thumbnail image
 *           example: "https://example.com/thumbnail.jpg"
 *         subtotal:
 *           type: number
 *           description: Subtotal for this item
 *           example: 2399.98
 * 
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - fullName
 *         - phone
 *         - email
 *         - addressLine1
 *         - city
 *         - state
 *         - postalCode
 *         - country
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of recipient
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           description: Phone number
 *           example: "+8801234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: "john@example.com"
 *         addressLine1:
 *           type: string
 *           description: Primary address line
 *           example: "123 Main Street"
 *         addressLine2:
 *           type: string
 *           description: Secondary address line
 *           example: "Apt 4B"
 *         city:
 *           type: string
 *           description: City name
 *           example: "Dhaka"
 *         state:
 *           type: string
 *           description: State/Division
 *           example: "Dhaka Division"
 *         postalCode:
 *           type: string
 *           description: Postal/ZIP code
 *           example: "1000"
 *         country:
 *           type: string
 *           description: Country name
 *           example: "Bangladesh"
 *         isDefault:
 *           type: boolean
 *           description: Whether this is default address
 *           example: true
 * 
 *     PaymentInfo:
 *       type: object
 *       properties:
 *         method:
 *           type: string
 *           enum: [card, cash_on_delivery, bank_transfer, digital_wallet]
 *           description: Payment method
 *           example: "cash_on_delivery"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           description: Payment status
 *           example: "pending"
 *         transactionId:
 *           type: string
 *           description: Transaction ID from payment gateway
 *           example: "TXN123456789"
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Payment completion date
 *           example: "2024-01-15T10:30:00Z"
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 2549.98
 * 
 *     OrderStatusHistory:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Order status
 *           example: "confirmed"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Status change timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         note:
 *           type: string
 *           description: Status change note
 *           example: "Order confirmed by admin"
 *         updatedBy:
 *           type: string
 *           description: User ID who updated status
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 * 
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *           example: "ORD-1705312200000-123"
 *         user:
 *           type: object
 *           description: User who placed the order
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
 *             phone:
 *               type: string
 *               example: "+8801234567890"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         subtotal:
 *           type: number
 *           description: Subtotal amount
 *           example: 2399.98
 *         shippingCost:
 *           type: number
 *           description: Shipping cost
 *           example: 100
 *         tax:
 *           type: number
 *           description: Tax amount
 *           example: 50
 *         discount:
 *           type: number
 *           description: Discount amount
 *           example: 0
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *           example: 2549.98
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned]
 *           description: Order status
 *           example: "pending"
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           description: Payment status
 *           example: "pending"
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         billingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentInfo:
 *           $ref: '#/components/schemas/PaymentInfo'
 *         shippingMethod:
 *           type: string
 *           description: Shipping method
 *           example: "standard"
 *         trackingNumber:
 *           type: string
 *           description: Shipping tracking number
 *           example: "TRK123456789"
 *         estimatedDelivery:
 *           type: string
 *           format: date-time
 *           description: Estimated delivery date
 *           example: "2024-01-20T00:00:00Z"
 *         actualDelivery:
 *           type: string
 *           format: date-time
 *           description: Actual delivery date
 *           example: "2024-01-19T14:30:00Z"
 *         statusHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderStatusHistory'
 *         notes:
 *           type: string
 *           description: Order notes
 *           example: "Please deliver after 6 PM"
 *         cancelReason:
 *           type: string
 *           description: Cancellation reason
 *           example: "Changed my mind"
 *         returnReason:
 *           type: string
 *           description: Return reason
 *           example: "Product defective"
 *         orderDate:
 *           type: string
 *           format: date-time
 *           description: Order creation date
 *           example: "2024-01-15T10:00:00Z"
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *           description: Order confirmation date
 *           example: "2024-01-15T10:30:00Z"
 *         shippedAt:
 *           type: string
 *           format: date-time
 *           description: Order shipping date
 *           example: "2024-01-16T09:00:00Z"
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Order delivery date
 *           example: "2024-01-19T14:30:00Z"
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Order cancellation date
 *           example: "2024-01-15T11:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record update timestamp
 *           example: "2024-01-15T10:30:00Z"
 * 
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - items
 *         - shippingAddress
 *         - paymentMethod
 *         - shippingMethod
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID
 *                 example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Quantity to order
 *                 example: 2
 *               selectedColor:
 *                 type: string
 *                 description: Selected color variant
 *                 example: "Blue"
 *               selectedSize:
 *                 type: string
 *                 description: Selected size variant
 *                 example: "256GB"
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         billingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethod:
 *           type: string
 *           enum: [card, cash_on_delivery, bank_transfer, digital_wallet]
 *           description: Payment method
 *           example: "cash_on_delivery"
 *         user:
 *           type: string
 *           description: User ID placing the order (Admin/POS only). If omitted, the authenticated user will be used.
 *           example: "64f8a1b2c3d4e5f6g7h8i9j0"
 *         shippingMethod:
 *           type: string
 *           description: Shipping method
 *           example: "standard"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Order notes
 *           example: "Please deliver after 6 PM"
 *         couponCode:
 *           type: string
 *           description: Coupon code for discount
 *           example: "SAVE10"
 * 
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned]
 *           description: New order status
 *           example: "confirmed"
 *         note:
 *           type: string
 *           maxLength: 500
 *           description: Status update note
 *           example: "Order confirmed and ready for processing"
 *         trackingNumber:
 *           type: string
 *           description: Shipping tracking number
 *           example: "TRK123456789"
 *         estimatedDelivery:
 *           type: string
 *           format: date
 *           description: Estimated delivery date
 *           example: "2024-01-20"
 * 
 *     UpdatePaymentStatusRequest:
 *       type: object
 *       required:
 *         - paymentStatus
 *       properties:
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           description: New payment status
 *           example: "paid"
 *         transactionId:
 *           type: string
 *           description: Transaction ID from payment gateway
 *           example: "TXN123456789"
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Payment completion date
 *           example: "2024-01-15T10:30:00Z"
 * 
 *     OrderSummary:
 *       type: object
 *       properties:
 *         totalOrders:
 *           type: integer
 *           description: Total number of orders
 *           example: 150
 *         pendingOrders:
 *           type: integer
 *           description: Number of pending orders
 *           example: 25
 *         completedOrders:
 *           type: integer
 *           description: Number of completed orders
 *           example: 100
 *         totalRevenue:
 *           type: number
 *           description: Total revenue from completed orders
 *           example: 125000.50
 * 
 *     OrdersListResponse:
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
 *           example: "Orders retrieved successfully"
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
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 */

export const OrderSchemas = {};
