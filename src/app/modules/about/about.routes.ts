import express from 'express';
import { getAbout, updateAbout } from './about.controller';
import { auth } from '../../middlewares/authMiddleware';
import { upload } from '../../config/cloudinary';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AboutUsSection:
 *       type: object
 *       properties:
 *         image: { type: string, description: 'Image URL' }
 *         title: { type: string }
 *         subtitle: { type: string }
 *         url: { type: string }
 *       example:
 *         image: "https://res.cloudinary.com/demo/image/upload/v1724662000/about/hero.jpg"
 *         title: "About BigSell"
 *         subtitle: "Your trusted electronics marketplace"
 *         url: "https://example.com/about"
 *     CounterSection:
 *       type: object
 *       properties:
 *         happyCustomers: { type: integer }
 *         electronicsProducts: { type: integer }
 *         activeSalesman: { type: integer }
 *         storeWorldwide: { type: integer }
 *       example:
 *         happyCustomers: 12500
 *         electronicsProducts: 3800
 *         activeSalesman: 120
 *         storeWorldwide: 18
 *     AboutInfoSection:
 *       type: object
 *       properties:
 *         image: { type: string, description: 'Image URL' }
 *         title: { type: string }
 *         description: { type: string }
 *       example:
 *         image: "https://res.cloudinary.com/demo/image/upload/v1724662100/about/info.jpg"
 *         title: "Who We Are"
 *         description: "We connect millions of customers with top electronics brands, ensuring quality, service, and value."
 *     WhyChooseItem:
 *       type: object
 *       properties:
 *         image: { type: string, description: 'Image URL' }
 *         title: { type: string }
 *         shortDesc: { type: string }
 *       example:
 *         image: "https://res.cloudinary.com/demo/image/upload/v1724662200/about/why-fast.jpg"
 *         title: "Fast Delivery"
 *         shortDesc: "Get your orders delivered within 48 hours in major cities."
 *     About:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         aboutUs:
 *           $ref: '#/components/schemas/AboutUsSection'
 *         counter:
 *           $ref: '#/components/schemas/CounterSection'
 *         aboutInfo:
 *           $ref: '#/components/schemas/AboutInfoSection'
 *         whyChooseUs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WhyChooseItem'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       example:
 *         _id: "66d0a2e2aa11223344556677"
 *         aboutUs:
 *           image: "https://res.cloudinary.com/demo/image/upload/v1724662000/about/hero.jpg"
 *           title: "About BigSell"
 *           subtitle: "Your trusted electronics marketplace"
 *           url: "https://example.com/about"
 *         counter:
 *           happyCustomers: 12500
 *           electronicsProducts: 3800
 *           activeSalesman: 120
 *           storeWorldwide: 18
 *         aboutInfo:
 *           image: "https://res.cloudinary.com/demo/image/upload/v1724662100/about/info.jpg"
 *           title: "Who We Are"
 *           description: "We connect millions of customers with top electronics brands, ensuring quality, service, and value."
 *         whyChooseUs:
 *           - image: "https://res.cloudinary.com/demo/image/upload/v1724662200/about/why-fast.jpg"
 *             title: "Fast Delivery"
 *             shortDesc: "Get your orders delivered within 48 hours in major cities."
 *           - image: "https://res.cloudinary.com/demo/image/upload/v1724662300/about/why-support.jpg"
 *             title: "24/7 Support"
 *             shortDesc: "Our experts are available around the clock."
 *           - image: "https://res.cloudinary.com/demo/image/upload/v1724662400/about/why-warranty.jpg"
 *             title: "Genuine Warranty"
 *             shortDesc: "All products are covered by official manufacturer warranty."
 *     AboutResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         statusCode: { type: integer }
 *         message: { type: string }
 *         data:
 *           $ref: '#/components/schemas/About'
 */

/**
 * @swagger
 * /v1/api/about:
 *   get:
 *     summary: Get About content
 *     description: Retrieve the singleton About content.
 *     tags: [About]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
 */
router.get('/', getAbout);

/**
 * @swagger
 * /v1/api/about:
 *   put:
 *     summary: Update About content
 *     description: Update the singleton About content. Send nested sections as JSON strings when using multipart/form-data. Images are optional and can be uploaded with named fields.
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               aboutUs: { type: string, description: 'JSON string for { image?, title?, subtitle?, url? }' }
 *               counter: { type: string, description: 'JSON string for { happyCustomers?, electronicsProducts?, activeSalesman?, storeWorldwide? }' }
 *               aboutInfo: { type: string, description: 'JSON string for { image?, title?, description? }' }
 *               whyChooseUs: { type: string, description: 'JSON array string of up to 3 items [{ image?, title?, shortDesc? }, ...]' }
 *               aboutUsImage: { type: string, format: binary }
 *               aboutInfoImage: { type: string, format: binary }
 *               why1Image: { type: string, format: binary }
 *               why2Image: { type: string, format: binary }
 *               why3Image: { type: string, format: binary }
 *           examples:
 *             UpdateAllSections:
 *               summary: Update all sections (no images)
 *               value:
 *                 aboutUs: '{"title":"About BigSell","subtitle":"Your trusted electronics marketplace","url":"https://example.com/about"}'
 *                 counter: '{"happyCustomers":13000,"electronicsProducts":4000,"activeSalesman":140,"storeWorldwide":20}'
 *                 aboutInfo: '{"title":"Who We Are","description":"We connect millions of customers with top electronics brands."}'
 *                 whyChooseUs: '[{"title":"Fast Delivery","shortDesc":"48-hour delivery in major cities"},{"title":"24/7 Support","shortDesc":"Experts around the clock"},{"title":"Genuine Warranty","shortDesc":"Official manufacturer coverage"}]'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutResponse'
 */
router.put(
  '/',
  auth('admin'),
  upload.fields([
    { name: 'aboutUsImage', maxCount: 1 },
    { name: 'aboutInfoImage', maxCount: 1 },
    { name: 'why1Image', maxCount: 1 },
    { name: 'why2Image', maxCount: 1 },
    { name: 'why3Image', maxCount: 1 },
  ]),
  updateAbout
);

export const aboutRouter = router;
