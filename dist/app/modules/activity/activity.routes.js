"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activity_controller_1 = require("./activity.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get all activities (admin only)
router.get('/all', (0, authMiddleware_1.auth)('admin'), activity_controller_1.getAllActivities);
// Get activity summary (admin only)
router.get('/summary', (0, authMiddleware_1.auth)('admin'), activity_controller_1.getActivitySummary);
// Get recent activities (admin only)
router.get('/recent', (0, authMiddleware_1.auth)('admin'), activity_controller_1.getRecentActivities);
exports.default = router;
