"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookmarkRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const bookmark_controller_1 = require("./bookmark.controller");
// import { authMiddleware } from '../../middlewares/authMiddleware';
const router = express_1.default.Router();
// Add menu item to bookmarks
router.post('/menu', (0, authMiddleware_1.auth)('user', 'vendor'), bookmark_controller_1.addMenuBookmark);
// Remove menu item from bookmarks
router.delete('/menu/:menuItemId', (0, authMiddleware_1.auth)('user', 'vendor'), bookmark_controller_1.removeMenuBookmark);
// Get user's bookmarks
router.get('/menu', (0, authMiddleware_1.auth)('user', 'vendor'), bookmark_controller_1.getUserBookmarks);
// Check if menu item is bookmarked
router.get('/menu/:menuItemId/status', (0, authMiddleware_1.auth)('user', 'vendor'), bookmark_controller_1.checkBookmarkStatus);
exports.bookmarkRouter = router;
