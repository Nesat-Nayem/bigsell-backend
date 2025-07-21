"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStaffRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_staff_controller_1 = require("./admin-staff.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Admin staff authentication
router.post('/login', admin_staff_controller_1.adminStaffLogin);
// Admin staff management routes (Admin only)
router.post('/', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.createAdminStaff);
router.get('/', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.getAdminStaff);
router.get('/:id', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.getAdminStaffById);
router.put('/:id', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.updateAdminStaff);
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.deleteAdminStaff);
router.put('/:id/restore', (0, authMiddleware_1.auth)('admin'), admin_staff_controller_1.restoreAdminStaff);
exports.adminStaffRouter = router;
