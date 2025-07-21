"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingRouter = void 0;
const express_1 = __importDefault(require("express"));
const pricing_controller_1 = require("./pricing.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get all pricing plans
router.get('/', pricing_controller_1.getAllPricingPlans);
// Create a new pricing plan (Admin only)
router.post('/', (0, authMiddleware_1.auth)('admin'), pricing_controller_1.createPricing);
// Get a single pricing plan by ID
router.get('/:id', pricing_controller_1.getPricingPlanById);
// Update a pricing plan by ID (Admin only)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), pricing_controller_1.updatePricingPlanById);
// Delete a pricing plan by ID (Admin only)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), pricing_controller_1.deletePricingPlanById);
exports.pricingRouter = router;
