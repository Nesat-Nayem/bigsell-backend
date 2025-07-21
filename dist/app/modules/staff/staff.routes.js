"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = __importDefault(require("express"));
const staff_controller_1 = require("./staff.controller");
const staff_menu_controller_1 = require("./staff.menu.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Staff authentication
router.post('/login', staff_controller_1.staffLogin);
// Staff menu access
router.get('/menu', (0, authMiddleware_1.auth)('staff'), staff_controller_1.getStaffHotelMenu);
router.get('/menu-items', (0, authMiddleware_1.auth)('staff'), staff_menu_controller_1.getAllMenuItems);
router.get('/menu-search', (0, authMiddleware_1.auth)('staff'), staff_menu_controller_1.searchMenuItems);
// Vendor staff management routes
router.post('/', (0, authMiddleware_1.auth)('vendor'), staff_controller_1.createStaff);
router.get('/', (0, authMiddleware_1.auth)('vendor'), staff_controller_1.getVendorStaff);
router.get('/:id', (0, authMiddleware_1.auth)('vendor'), staff_controller_1.getStaffById);
router.put('/:id', (0, authMiddleware_1.auth)('vendor'), staff_controller_1.updateStaff);
router.delete('/:id', (0, authMiddleware_1.auth)('vendor'), staff_controller_1.deleteStaff);
exports.staffRouter = router;
