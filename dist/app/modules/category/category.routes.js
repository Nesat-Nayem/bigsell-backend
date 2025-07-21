"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new category with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), category_controller_1.createCategory);
// Get all categories
router.get('/', category_controller_1.getAllCategories);
// Get a single category by ID
router.get('/:id', category_controller_1.getCategoryById);
// Update a category by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), category_controller_1.updateCategoryById);
// Delete a category by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), category_controller_1.deleteCategoryById);
exports.categoryRouter = router;
