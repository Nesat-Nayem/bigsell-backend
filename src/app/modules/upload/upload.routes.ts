import express from 'express';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';
import { uploadSingleImage, uploadMultipleImages, uploadKYCDocument, deleteUploadedFile } from './upload.controller';

const router = express.Router();

// Upload a single image (requires authentication)
router.post('/single', auth(), upload.single('image'), uploadSingleImage);

// Upload multiple images (requires authentication)
router.post('/multiple', auth(), upload.array('images', 10), uploadMultipleImages);

// Upload KYC document (public route for KYC form)
router.post('/kyc-document', upload.single('document'), uploadKYCDocument);

// Get a list of uploaded files (requires admin privileges, for example)
// router.get('/', authMiddleware, adminMiddleware, listUploadedFiles);

// Delete an uploaded file by public ID (requires authentication and ownership/admin privileges)
router.delete('/delete/:publicId', auth(), deleteUploadedFile);

export const uploadRouter = router;