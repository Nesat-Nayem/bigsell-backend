import express from 'express';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from './blog.controller';
import { auth } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { upload } from '../../config/cloudinary';
// import { upload } from '../../config/multer';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Admin routes
router.post('/', auth('admin'), upload.single('image'), createBlog);
router.put('/:id', auth('admin'), upload.single('image'), updateBlog);
router.delete('/:id', auth('admin'), deleteBlog);

export const blogRouter = router;