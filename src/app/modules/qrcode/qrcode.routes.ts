import express from 'express';
import {
    createQRCode,
    getAllQRCodes,
    getQRCodeById,
    deleteQRCodeById,
    updateQRCodeById,
    bookTableByScan,
} from './qrcode.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new QR Code
router.post('/', auth('admin', 'vendor'), createQRCode);

// Book a table by scanning QR code
router.post('/book', auth('user',  'vendor', 'staff'), bookTableByScan);


// Get all QR Codes
router.get('/', auth('user','admin', 'vendor', 'staff'), getAllQRCodes);

// Get a single QR Code by ID
router.get('/:id', auth('admin', 'vendor'), getQRCodeById);

// Update a QR Code by ID
router.put('/:id', auth('admin', 'vendor'), updateQRCodeById);

// Delete a QR Code by ID
router.delete('/:id', auth('admin', 'vendor'), deleteQRCodeById);

export const qrcodeRouter = router; 