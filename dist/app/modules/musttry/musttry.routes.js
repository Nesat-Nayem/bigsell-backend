"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustTryRouter = void 0;
const express_1 = __importDefault(require("express"));
const musttry_controller_1 = require("./musttry.controller");
const cloudinary_1 = require("../../config/cloudinary");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new mustTry item with image upload
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), musttry_controller_1.createMustTry);
// Get all mustTry items (with optional active filter)
router.get('/', musttry_controller_1.getAllMustTry);
// Get a single mustTry item by ID
router.get('/:id', (0, authMiddleware_1.auth)('admin'), musttry_controller_1.getMustTryById);
// Update a mustTry item by ID with optional image upload
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), musttry_controller_1.updateMustTryById);
// Delete a mustTry item by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), musttry_controller_1.deleteMustTryById);
exports.mustTryRouter = router;
