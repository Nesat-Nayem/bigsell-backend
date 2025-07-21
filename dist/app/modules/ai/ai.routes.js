"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const ai_controller_1 = require("./ai.controller");
const router = express_1.default.Router();
// Generate product description
router.post("/generate-description", (0, authMiddleware_1.auth)(), ai_controller_1.generateDescriptionController);
// Improve existing description
router.post("/improve-description", (0, authMiddleware_1.auth)(), ai_controller_1.improveDescriptionController);
// Generate legal/info document content
router.post("/generate-document", (0, authMiddleware_1.auth)("admin"), ai_controller_1.generateDocumentController);
// Generic text generation API for reusability
router.post("/generate-text", (0, authMiddleware_1.auth)(), ai_controller_1.generateGenericText);
// Get AI food suggestions from all hotels
router.get("/food-suggestions", ai_controller_1.getAIFoodSuggestions);
// Hotel-specific AI chat for menu assistance
router.post("/hotel-menu-chat", ai_controller_1.getHotelMenuChat);
exports.aiRouter = router;
