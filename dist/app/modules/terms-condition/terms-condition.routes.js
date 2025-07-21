"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsConditionRouter = void 0;
const express_1 = __importDefault(require("express"));
const terms_condition_controller_1 = require("./terms-condition.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get privacy policy (public)
router.get('/', terms_condition_controller_1.getTermsCondition);
// Update privacy policy (admin only)
router.put('/', (0, authMiddleware_1.auth)('admin'), terms_condition_controller_1.updateTermsCondition);
exports.TermsConditionRouter = router;
