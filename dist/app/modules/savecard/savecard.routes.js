"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCardRouter = void 0;
const express_1 = __importDefault(require("express"));
const savecard_controller_1 = require("./savecard.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new saved card
router.post('/', (0, authMiddleware_1.auth)('user'), savecard_controller_1.createSaveCard);
// Get all saved cards for the authenticated user
router.get('/', (0, authMiddleware_1.auth)('user'), savecard_controller_1.getAllSaveCards);
// Get a single saved card by ID
router.get('/:id', (0, authMiddleware_1.auth)('user'), savecard_controller_1.getSaveCardById);
// Update a saved card by ID
router.put('/:id', (0, authMiddleware_1.auth)('user'), savecard_controller_1.updateSaveCardById);
// Delete a saved card by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('user'), savecard_controller_1.deleteSaveCardById);
exports.saveCardRouter = router;
