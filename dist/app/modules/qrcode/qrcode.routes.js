"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrcodeRouter = void 0;
const express_1 = __importDefault(require("express"));
const qrcode_controller_1 = require("./qrcode.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new QR Code
router.post('/', (0, authMiddleware_1.auth)('admin', 'vendor'), qrcode_controller_1.createQRCode);
// Book a table by scanning QR code
router.post('/book', (0, authMiddleware_1.auth)('user', 'vendor', 'staff'), qrcode_controller_1.bookTableByScan);
// Get all QR Codes
router.get('/', (0, authMiddleware_1.auth)('user', 'admin', 'vendor', 'staff'), qrcode_controller_1.getAllQRCodes);
// Get a single QR Code by ID
router.get('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), qrcode_controller_1.getQRCodeById);
// Update a QR Code by ID
router.put('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), qrcode_controller_1.updateQRCodeById);
// Delete a QR Code by ID
router.delete('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), qrcode_controller_1.deleteQRCodeById);
exports.qrcodeRouter = router;
