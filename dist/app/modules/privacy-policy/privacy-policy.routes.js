"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privacyPolicyRouter = void 0;
const express_1 = __importDefault(require("express"));
const privacy_policy_controller_1 = require("./privacy-policy.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get privacy policy (public)
router.get('/', privacy_policy_controller_1.getPrivacyPolicy);
// Update privacy policy (admin only)
router.put('/', (0, authMiddleware_1.auth)('admin'), privacy_policy_controller_1.updatePrivacyPolicy);
exports.privacyPolicyRouter = router;
