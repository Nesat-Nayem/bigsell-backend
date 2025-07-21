"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerRouter = void 0;
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new banner with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), banner_controller_1.createBanner);
// Get all banners (with optional active filter)
router.get('/', banner_controller_1.getAllBanners);
// Get a single banner by ID
router.get('/:id', banner_controller_1.getBannerById);
// Update a banner by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), banner_controller_1.updateBannerById);
// Delete a banner by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), banner_controller_1.deleteBannerById);
exports.bannerRouter = router;
