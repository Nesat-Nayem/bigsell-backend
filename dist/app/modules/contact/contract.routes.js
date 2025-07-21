"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRouter = void 0;
const express_1 = __importDefault(require("express"));
const contract_controller_1 = require("./contract.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Create a new contract (public route - no auth needed)
router.post('/', contract_controller_1.createContract);
// Get all contracts (admin only)
router.get('/', (0, authMiddleware_1.auth)('admin'), contract_controller_1.getAllContracts);
// Get a single contract by ID
router.get('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.getContractById);
// Update a contract by ID (admin only)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.updateContractById);
// Delete a contract by ID (admin only)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.deleteContractById);
// Update contract status (admin only)
router.patch('/:id/status', (0, authMiddleware_1.auth)('admin'), contract_controller_1.updateContractStatus);
exports.contractRouter = router;
