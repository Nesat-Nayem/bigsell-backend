"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountOfferRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const cloudinary_1 = require("../../config/cloudinary");
const discount_offer_controller_1 = require("./discount-offer.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     DiscountOffer:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         offer: { type: string }
 *         image: { type: string, description: 'Image URL' }
 *         isDeleted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       example:
 *         _id: "66cfb6a7a3b2f1d234567890"
 *         title: "Mega Festive Sale"
 *         offer: "Up to 50% OFF on all electronics"
 *         image: "https://res.cloudinary.com/demo/image/upload/v1724660000/discounts/festive.jpg"
 *         isDeleted: false
 *         createdAt: "2025-08-26 10:00:00"
 *         updatedAt: "2025-08-26 10:00:00"
 *     DiscountOfferResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/DiscountOffer'
 *     DiscountOfferListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DiscountOffer'
 */
/**
 * @swagger
 * /v1/api/discount-offers:
 *   get:
 *     summary: Get all discount offers
 *     tags: [Discount Offers]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountOfferListResponse'
 */
router.get('/', discount_offer_controller_1.getAllDiscountOffers);
/**
 * @swagger
 * /v1/api/discount-offers/{id}:
 *   get:
 *     summary: Get a discount offer by ID
 *     tags: [Discount Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountOfferResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', discount_offer_controller_1.getDiscountOfferById);
/**
 * @swagger
 * /v1/api/discount-offers:
 *   post:
 *     summary: Create a discount offer
 *     tags: [Discount Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, offer, image]
 *             properties:
 *               title: { type: string }
 *               offer: { type: string }
 *               image: { type: string, format: binary }
 *           encoding:
 *             image:
 *               contentType: image/png, image/jpeg
 *           examples:
 *             Example 1:
 *               summary: Create discount offer
 *               value:
 *                 title: "Weekend Bonanza"
 *                 offer: "Flat 30% OFF on home appliances"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountOfferResponse'
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), discount_offer_controller_1.createDiscountOffer);
/**
 * @swagger
 * /v1/api/discount-offers/{id}:
 *   put:
 *     summary: Update a discount offer
 *     tags: [Discount Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               offer: { type: string }
 *               image: { type: string, format: binary }
 *           examples:
 *             Example 1:
 *               summary: Update text only
 *               value:
 *                 title: "Weekend Bonanza Extended"
 *                 offer: "Flat 35% OFF on home appliances"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountOfferResponse'
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), discount_offer_controller_1.updateDiscountOfferById);
/**
 * @swagger
 * /v1/api/discount-offers/{id}:
 *   delete:
 *     summary: Delete a discount offer
 *     tags: [Discount Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountOfferResponse'
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), discount_offer_controller_1.deleteDiscountOfferById);
exports.discountOfferRouter = router;
