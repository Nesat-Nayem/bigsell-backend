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
/**
 * @swagger
 * tags:
 *   - name: Contacts
 *     description: Contact messages management
 */
/**
 * @swagger
 * /v1/api/contracts:
 *   post:
 *     summary: Submit a contact message
 *     description: Public endpoint to create a new contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create a new contract (public route - no auth needed)
router.post('/', contract_controller_1.createContract);
/**
 * @swagger
 * /v1/api/contracts:
 *   get:
 *     summary: List contact messages
 *     description: Admin-only listing with optional status filter
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
// Get all contracts (admin only)
router.get('/', (0, authMiddleware_1.auth)('admin'), contract_controller_1.getAllContracts);
/**
 * @swagger
 * /v1/api/contracts/{id}:
 *   get:
 *     summary: Get a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Not found
 */
// Get a single contract by ID
router.get('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.getContractById);
/**
 * @swagger
 * /v1/api/contracts/{id}:
 *   put:
 *     summary: Update a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Not found
 */
// Update a contract by ID (admin only)
router.put('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.updateContractById);
/**
 * @swagger
 * /v1/api/contracts/{id}:
 *   delete:
 *     summary: Delete a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Not found
 */
// Delete a contract by ID (admin only)
router.delete('/:id', (0, authMiddleware_1.auth)('admin'), contract_controller_1.deleteContractById);
/**
 * @swagger
 * /v1/api/contracts/{id}/status:
 *   patch:
 *     summary: Update contact status
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Not found
 */
// Update contract status (admin only)
router.patch('/:id/status', (0, authMiddleware_1.auth)('admin'), contract_controller_1.updateContractStatus);
exports.contractRouter = router;
