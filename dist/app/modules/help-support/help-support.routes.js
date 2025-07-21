"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpSupportRouter = void 0;
const express_1 = __importDefault(require("express"));
const help_support_controller_1 = require("./help-support.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get help and support content (public)
router.get('/', help_support_controller_1.getHelpSupport);
// Update help and support content (admin only)
router.put('/', (0, authMiddleware_1.auth)('admin'), help_support_controller_1.updateHelpSupport);
exports.helpSupportRouter = router;
