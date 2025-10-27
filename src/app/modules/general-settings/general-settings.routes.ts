import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { upload } from '../../config/cloudinary';
import { getGeneralSettings, updateGeneralSettings } from './general-settings.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     GeneralSettings:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         number: { type: string }
 *         email: { type: string }
 *         facebook: { type: string }
 *         instagram: { type: string }
 *         linkedIn: { type: string }
 *         twitter: { type: string }
 *         youtube: { type: string }
 *         favicon: { type: string, description: 'Favicon URL' }
 *         logo: { type: string, description: 'Logo URL' }
 *         headerTab: { type: string }
 *         address: { type: string }
 *         iframe: { type: string }
 *         freeShippingThreshold: { type: number, description: 'Cart total to unlock free shipping' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       example:
 *         _id: "66d0c4f2aa11bb22cc33dd55"
 *         number: "+971 55 123 4567"
 *         email: "support@example.com"
 *         facebook: "https://facebook.com/bigsell"
 *         instagram: "https://instagram.com/bigsell"
 *         linkedIn: "https://www.linkedin.com/company/bigsell"
 *         twitter: "https://twitter.com/bigsell"
 *         youtube: "https://youtube.com/@bigsell"
 *         favicon: "https://res.cloudinary.com/demo/image/upload/v1724663000/settings/favicon.png"
 *         logo: "https://res.cloudinary.com/demo/image/upload/v1724663000/settings/logo.png"
 *         headerTab: "BigSell - Best Electronics Deals"
 *         address: "Office 123, Dubai, UAE"
 *         iframe: "<iframe src='https://maps.google.com/...'></iframe>"
 *         freeShippingThreshold: 10000
 *         createdAt: "2025-08-26 11:00:00"
 *         updatedAt: "2025-08-26 11:00:00"
 *     GeneralSettingsResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/GeneralSettings'
 */

/**
 * @swagger
 * /v1/api/general-settings:
 *   get:
 *     summary: Get general settings
 *     tags: [General Settings]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralSettingsResponse'
 */
router.get('/', getGeneralSettings);

/**
 * @swagger
 * /v1/api/general-settings:
 *   put:
 *     summary: Update general settings
 *     tags: [General Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               number: { type: string }
 *               email: { type: string }
 *               facebook: { type: string }
 *               instagram: { type: string }
 *               linkedIn: { type: string }
 *               twitter: { type: string }
 *               youtube: { type: string }
 *               headerTab: { type: string }
 *               address: { type: string }
 *               iframe: { type: string }
  *               freeShippingThreshold: { type: number }
 *               favicon: { type: string, format: binary }
 *               logo: { type: string, format: binary }
 *           encoding:
 *             favicon:
 *               contentType: image/png, image/x-icon, image/jpeg
 *             logo:
 *               contentType: image/png, image/jpeg, image/webp
 *           examples:
 *             UpdateTextOnly:
 *               summary: Update without images
 *               value:
 *                 number: "+971 55 123 4567"
 *                 email: "support@example.com"
 *                 facebook: "https://facebook.com/bigsell"
 *                 instagram: "https://instagram.com/bigsell"
 *                 linkedIn: "https://www.linkedin.com/company/bigsell"
 *                 twitter: "https://twitter.com/bigsell"
 *                 youtube: "https://youtube.com/@bigsell"
 *                 headerTab: "BigSell - Best Electronics Deals"
 *                 address: "Office 123, Dubai, UAE"
 *                 iframe: "<iframe src='https://maps.google.com/...'></iframe>"
  *                 freeShippingThreshold: 10000
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralSettingsResponse'
 */
router.put(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'favicon', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  updateGeneralSettings
);

export const generalSettingsRouter = router;
