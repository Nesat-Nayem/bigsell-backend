"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRouter = void 0;
const express_1 = __importDefault(require("express"));
const blog_controller_1 = require("./blog.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const cloudinary_1 = require("../../config/cloudinary");
// import { upload } from '../../config/multer';
const router = express_1.default.Router();
// Public routes
router.get('/', blog_controller_1.getBlogs);
router.get('/:id', blog_controller_1.getBlogById);
// Admin routes
router.post('/', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), blog_controller_1.createBlog);
router.put('/:id', (0, authMiddleware_1.auth)('admin'), cloudinary_1.upload.single('image'), blog_controller_1.updateBlog);
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), blog_controller_1.deleteBlog);
exports.blogRouter = router;
