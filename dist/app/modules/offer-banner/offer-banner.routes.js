"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerBannerRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const cloudinary_1 = require("../../config/cloudinary");
const offer_banner_controller_1 = require("./offer-banner.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     OfferBanner:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         subtitle: { type: string }
 *         offer: { type: string }
 *         url: { type: string }
 *         image: { type: string, description: 'Image URL' }
 *         isDeleted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       example:
 *         _id: "66d0a1f1f2c3a4b5c6d7e8f9"
 *         title: "Back To School Deals"
 *         subtitle: "Top picks for students"
 *         offer: "Save up to 40% on laptops"
 *         url: "https://example.com/deals/back-to-school"
 *         image: "https://res.cloudinary.com/demo/image/upload/v1724661000/offer-banners/bts.jpg"
 *         isDeleted: false
 *         createdAt: "2025-08-26 10:15:00"
 *         updatedAt: "2025-08-26 10:15:00"
 *     OfferBannerResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/OfferBanner'
 *     OfferBannerListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OfferBanner'
 */
/**
 * @swagger
 * /v1/api/offer-banners:
 *   get:
 *     summary: Get all offer banners
 *     tags: [Offer Banners]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferBannerListResponse'
 */
router.get('/', offer_banner_controller_1.getAllOfferBanners);
/**
 * @swagger
 * /v1/api/offer-banners/{id}:
 *   get:
 *     summary: Get an offer banner by ID
 *     tags: [Offer Banners]
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
 *               $ref: '#/components/schemas/OfferBannerResponse'
 *       404:
 *         description: Not found
 */
router.get('/:id', offer_banner_controller_1.getOfferBannerById);
/**
 * @swagger
 * /v1/api/offer-banners:
 *   post:
 *     summary: Create an offer banner
 *     tags: [Offer Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, subtitle, offer, url, image]
 *             properties:
 *               title: { type: string }
 *               subtitle: { type: string }
 *               offer: { type: string }
 *               url: { type: string }
 *               image: { type: string, format: binary }
 *           encoding:
 *             image:
 *               contentType: image/png, image/jpeg
 *           examples:
 *             Default:
 *               summary: Create an offer banner
 *               value:
 *                 title: "Back To School Deals"
 *                 subtitle: "Top picks for students"
 *                 offer: "Save up to 40% on laptops"
 *                 url: "https://example.com/deals/back-to-school"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferBannerResponse'
 */
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), offer_banner_controller_1.createOfferBanner);
/**
 * @swagger
 * /v1/api/offer-banners/{id}:
 *   put:
 *     summary: Update an offer banner
 *     tags: [Offer Banners]
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
 *               subtitle: { type: string }
 *               offer: { type: string }
 *               url: { type: string }
 *               image: { type: string, format: binary }
 *           examples:
 *             TextOnly:
 *               summary: Update text fields only
 *               value:
 *                 title: "Back To School Super Deals"
 *                 subtitle: "Best picks for campus life"
 *                 offer: "Save up to 45% on laptops"
 *                 url: "https://example.com/deals/back-to-school"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferBannerResponse'
 */
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), offer_banner_controller_1.updateOfferBannerById);
/**
 * @swagger
 * /v1/api/offer-banners/{id}:
 *   delete:
 *     summary: Delete an offer banner
 *     tags: [Offer Banners]
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
 *               $ref: '#/components/schemas/OfferBannerResponse'
 */
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), offer_banner_controller_1.deleteOfferBannerById);
exports.offerBannerRouter = router;
