"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureOfferRouter = void 0;
const express_1 = __importDefault(require("express"));
const feature_offer_controller_1 = require("./feature-offer.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new feature offer with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), feature_offer_controller_1.createFeatureOffer);
// Get all feature offers (with optional active filter)
router.get('/', feature_offer_controller_1.getAllFeatureOffers);
// Get a single feature offer by ID
router.get('/:id', feature_offer_controller_1.getFeatureOfferById);
// Update a feature offer by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), feature_offer_controller_1.updateFeatureOfferById);
// Delete a feature offer by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), feature_offer_controller_1.deleteFeatureOfferById);
exports.featureOfferRouter = router;
