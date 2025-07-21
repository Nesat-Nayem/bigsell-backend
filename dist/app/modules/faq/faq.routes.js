"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRouter = void 0;
const express_1 = __importDefault(require("express"));
const faq_controller_1 = require("./faq.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new FAQ (admin only)
router.post('/', (0, authMiddleware_1.auth)('admin'), faq_controller_1.createFAQ);
// Get all FAQs (public)
router.get('/', faq_controller_1.getAllFAQs);
// Get a single FAQ by ID (public)
router.get('/:id', faq_controller_1.getFAQById);
// Update a FAQ by ID (admin only)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), faq_controller_1.updateFAQById);
// Delete a FAQ by ID (admin only)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), faq_controller_1.deleteFAQById);
// Generate FAQ answer using AI
router.post('/generate-answer', (0, authMiddleware_1.auth)('admin'), faq_controller_1.generateFAQAnswer);
exports.faqRouter = router;
