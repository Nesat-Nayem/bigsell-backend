"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelRouter = void 0;
const express_1 = __importDefault(require("express"));
const hotel_controller_1 = require("./hotel.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new hotel with image upload (admin or vendor)
router.post('/', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('mainImage'), hotel_controller_1.createHotel);
// Get all hotels (with optional filters) - public
router.get('/', hotel_controller_1.getAllHotels);
// Get filter options - public
router.get('/filter-options', hotel_controller_1.getFilterOptions);
// Get nearby hotels with calculated distances - public
router.get('/nearby', hotel_controller_1.getHotelsWithDistance);
// Get a single hotel by ID - public
router.get('/:id', hotel_controller_1.getHotelById);
// Update a hotel by ID with optional image upload (admin or vendor who owns the hotel)
router.put('/:id', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('mainImage'), hotel_controller_1.updateHotelById);
// Delete a hotel by ID (soft delete) (admin or vendor who owns the hotel)
router.delete('/:id', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.deleteHotelById);
// Restore a soft-deleted hotel (admin or vendor who owns the hotel)
router.put('/:id/restore', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.restoreHotelById);
// Get deleted hotels for restoration (admin or vendor)
router.get('/deleted/list', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.getDeletedHotels);
// Add gallery images to a hotel (admin or vendor who owns the hotel)
router.post('/:id/gallery', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.array('images', 10), hotel_controller_1.addGalleryImages);
// Remove a gallery image from a hotel (admin or vendor who owns the hotel)
router.delete('/:hotelId/gallery/:imageUrl', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.removeGalleryImage);
// Get menu categories for a hotel - public
router.get('/:id/menu', hotel_controller_1.getHotelMenu);
// Get menu items by category - public
router.get('/:id/menu/:categoryName', hotel_controller_1.getMenuItemsByCategory);
// Get food item details - public
router.get('/:id/food/:foodId', hotel_controller_1.getFoodItemDetails);
// Add a review to a hotel - authenticated users
router.post('/:id/reviews', (0, authMiddleware_1.auth)('user'), hotel_controller_1.addHotelReview);
// Get hotel reviews - public
router.get('/:id/reviews', hotel_controller_1.getHotelReviews);
// Get buffets for a hotel - public
router.get('/:id/buffets', hotel_controller_1.getHotelBuffets);
// Add a new menu category (admin or vendor who owns the hotel)
router.post('/:id/menu-categories', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('image'), hotel_controller_1.addMenuCategory);
// Add a food item to a category (admin or vendor who owns the hotel)
router.post('/:id/menu-categories/:categoryName/items', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('image'), hotel_controller_1.addFoodItem);
// Update a food item (admin or vendor who owns the hotel)
router.put('/:id/food/:foodId', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('image'), hotel_controller_1.updateFoodItem);
// Delete a food item (admin or vendor who owns the hotel)
router.delete('/:id/food/:foodId', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.deleteFoodItem);
// Add buffet to hotel (admin or vendor who owns the hotel)
router.post('/:id/buffets', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.addBuffet);
// Update/delete buffet (admin or vendor who owns the hotel)
router.put('/:id/buffets/:buffetId', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.updateBuffet);
router.delete('/:id/buffets/:buffetId', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.deleteBuffet);
// Get/Update menu settings (item types, attributes)
router.get('/:id/menu-settings', hotel_controller_1.getMenuSettings);
router.put('/:id/menu-settings', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.updateMenuSettings);
// Menu category operations (admin or vendor who owns the hotel)
router.put('/:id/menu-categories/:categoryName', (0, authMiddleware_1.auth)('vendor', 'admin'), cloudinary_1.upload.single('image'), hotel_controller_1.updateMenuCategory);
router.delete('/:id/menu-categories/:categoryName', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.deleteMenuCategory);
// Get hotel offers - public
router.get('/:id/offers', hotel_controller_1.getHotelOffers);
// Update hotel offers (admin or vendor who owns the hotel)
router.put('/:id/offers', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.updateHotelOffers);
// Get hotel about information - public
router.get('/:id/about', hotel_controller_1.getHotelAboutInfo);
// Update hotel about information (admin or vendor who owns the hotel)
router.put('/:id/about', (0, authMiddleware_1.auth)('vendor', 'admin'), hotel_controller_1.updateHotelAboutInfo);
// Add a route to get vendor's hotels
router.get('/vendor/my-hotels', (0, authMiddleware_1.auth)('vendor'), hotel_controller_1.getVendorHotels);
// Add this route for getting hotels list for QR code selection
router.get('/list/for-qrcode', (0, authMiddleware_1.auth)('admin', 'vendor'), hotel_controller_1.getHotelsForQRCode);
// Get platform activity for admin dashboard
router.get('/admin/platform-activity', (0, authMiddleware_1.auth)('admin'), hotel_controller_1.getPlatformActivity);
exports.hotelRouter = router;
