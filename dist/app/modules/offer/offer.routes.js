"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerRouter = void 0;
const express_1 = __importDefault(require("express"));
const offer_controller_1 = require("./offer.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new offer with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), offer_controller_1.createOffer);
// Get all offers (with optional active filter)
router.get('/', offer_controller_1.getAllOffers);
// Get a single offer by ID
router.get('/:id', (0, authMiddleware_1.auth)('user'), offer_controller_1.getOfferById);
// Update an offer by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), offer_controller_1.updateOfferById);
// Delete an offer by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), offer_controller_1.deleteOfferById);
exports.offerRouter = router;
