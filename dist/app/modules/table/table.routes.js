"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const table_controller_1 = require("./table.controller");
const router = express_1.default.Router();
// Create a new table
router.post('/', (0, authMiddleware_1.auth)('admin', 'vendor'), table_controller_1.createTable);
// Get all tables (with optional active filter)
router.get('/', table_controller_1.getAllTables);
// Get a single table by ID
router.get('/:id', (0, authMiddleware_1.auth)('admin', 'vendor'), table_controller_1.getTableById);
// Update a table by ID
router.put('/:id', (0, authMiddleware_1.auth)('admin'), table_controller_1.updateTableById);
// Delete a table by ID (soft delete)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), table_controller_1.deleteTableById);
exports.tableRouter = router;
