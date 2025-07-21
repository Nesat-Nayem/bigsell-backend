"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new product with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), product_controller_1.createProduct);
// Get all products (with optional category filter)
router.get('/', product_controller_1.getAllProducts);
// Get a single product by ID
router.get('/:id', product_controller_1.getProductById);
// Update a product by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), product_controller_1.updateProductById);
// Delete a product by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), product_controller_1.deleteProductById);
exports.productRouter = router;
