import express from 'express';
import { 
  createHotel, 
  getAllHotels, 
  getHotelById, 
  updateHotelById, 
  deleteHotelById,
  restoreHotelById,
  getDeletedHotels,
  addGalleryImages,
  removeGalleryImage,
  getHotelMenu,
  getMenuItemsByCategory,
  getFoodItemDetails,
  addHotelReview,
  getHotelReviews,
  getHotelBuffets,
  addMenuCategory,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  addBuffet,
  getHotelOffers,
  updateHotelOffers,
  getHotelAboutInfo,
  updateHotelAboutInfo,
  getFilterOptions,
  updateBuffet,
  deleteBuffet,
  updateMenuCategory,
  deleteMenuCategory,
  getVendorHotels,
  getHotelsForQRCode,
  getMenuSettings,
  updateMenuSettings,
  getPlatformActivity,
  getHotelsWithDistance,
} from './hotel.controller';


import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new hotel with image upload (admin or vendor)
router.post('/', auth('vendor', 'admin'), upload.single('mainImage'), createHotel);

// Get all hotels (with optional filters) - public
router.get('/', getAllHotels);



// Get filter options - public
router.get('/filter-options', getFilterOptions);

// Get nearby hotels with calculated distances - public
router.get('/nearby', getHotelsWithDistance);

// Get a single hotel by ID - public
router.get('/:id', getHotelById);

// Update a hotel by ID with optional image upload (admin or vendor who owns the hotel)
router.put('/:id', auth('vendor', 'admin'), upload.single('mainImage'), updateHotelById);

// Delete a hotel by ID (soft delete) (admin or vendor who owns the hotel)
router.delete('/:id', auth('vendor', 'admin'), deleteHotelById);

// Restore a soft-deleted hotel (admin or vendor who owns the hotel)
router.put('/:id/restore', auth('vendor', 'admin'), restoreHotelById);

// Get deleted hotels for restoration (admin or vendor)
router.get('/deleted/list', auth('vendor', 'admin'), getDeletedHotels);

// Add gallery images to a hotel (admin or vendor who owns the hotel)
router.post('/:id/gallery', auth('vendor', 'admin'), upload.array('images', 10), addGalleryImages);

// Remove a gallery image from a hotel (admin or vendor who owns the hotel)
router.delete('/:hotelId/gallery/:imageUrl', auth('vendor', 'admin'), removeGalleryImage);

// Get menu categories for a hotel - public
router.get('/:id/menu', getHotelMenu);

// Get menu items by category - public
router.get('/:id/menu/:categoryName', getMenuItemsByCategory);

// Get food item details - public
router.get('/:id/food/:foodId', getFoodItemDetails);

// Add a review to a hotel - authenticated users
router.post('/:id/reviews', auth('user'), addHotelReview);

// Get hotel reviews - public
router.get('/:id/reviews', getHotelReviews);

// Get buffets for a hotel - public
router.get('/:id/buffets', getHotelBuffets);

// Add a new menu category (admin or vendor who owns the hotel)
router.post('/:id/menu-categories', auth('vendor', 'admin'), upload.single('image'), addMenuCategory);

// Add a food item to a category (admin or vendor who owns the hotel)
router.post('/:id/menu-categories/:categoryName/items', auth('vendor', 'admin'), upload.single('image'), addFoodItem);

// Update a food item (admin or vendor who owns the hotel)
router.put('/:id/food/:foodId', auth('vendor', 'admin'), upload.single('image'), updateFoodItem);

// Delete a food item (admin or vendor who owns the hotel)
router.delete('/:id/food/:foodId', auth('vendor', 'admin'), deleteFoodItem);

// Add buffet to hotel (admin or vendor who owns the hotel)
router.post('/:id/buffets', auth('vendor', 'admin'), addBuffet);

// Update/delete buffet (admin or vendor who owns the hotel)
router.put('/:id/buffets/:buffetId', auth('vendor', 'admin'), updateBuffet);
router.delete('/:id/buffets/:buffetId', auth('vendor', 'admin'), deleteBuffet);

// Get/Update menu settings (item types, attributes)
router.get('/:id/menu-settings', getMenuSettings);
router.put('/:id/menu-settings', auth('vendor', 'admin'), updateMenuSettings);

// Menu category operations (admin or vendor who owns the hotel)
router.put('/:id/menu-categories/:categoryName', auth('vendor', 'admin'), upload.single('image'), updateMenuCategory);
router.delete('/:id/menu-categories/:categoryName', auth('vendor', 'admin'), deleteMenuCategory);

// Get hotel offers - public
router.get('/:id/offers', getHotelOffers);

// Update hotel offers (admin or vendor who owns the hotel)
router.put('/:id/offers', auth('vendor', 'admin'), updateHotelOffers);

// Get hotel about information - public
router.get('/:id/about', getHotelAboutInfo);

// Update hotel about information (admin or vendor who owns the hotel)
router.put('/:id/about', auth('vendor', 'admin'), updateHotelAboutInfo);

// Add a route to get vendor's hotels
router.get('/vendor/my-hotels', auth('vendor'), getVendorHotels);

// Add this route for getting hotels list for QR code selection
router.get('/list/for-qrcode', auth('admin', 'vendor'), getHotelsForQRCode);

// Get platform activity for admin dashboard
router.get('/admin/platform-activity', auth('admin'), getPlatformActivity);

export const hotelRouter = router;