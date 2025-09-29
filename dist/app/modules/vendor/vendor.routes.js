"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRouter = void 0;
const express_1 = __importDefault(require("express"));
const vendor_controller_clean_1 = require("./vendor.controller.clean");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public: vendor application submission
router.post('/apply', vendor_controller_clean_1.applyVendor);
// Admin: list/search/pagination
router.get('/', (0, authMiddleware_1.auth)('admin'), vendor_controller_clean_1.getVendors);
// Admin: get one
router.get('/:id', (0, authMiddleware_1.auth)('admin'), vendor_controller_clean_1.getVendorById);
// Admin: update fields
router.put('/:id', (0, authMiddleware_1.auth)('admin'), vendor_controller_clean_1.updateVendor);
// Admin: update KYC status (approve/reject)
router.patch('/:id/status', (0, authMiddleware_1.auth)('admin'), vendor_controller_clean_1.updateKycStatus);
// Admin: soft delete application
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), vendor_controller_clean_1.deleteVendor);
exports.vendorRouter = router;
