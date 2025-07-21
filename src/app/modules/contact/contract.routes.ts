import express from 'express';
import { 
  createContract, 
  getAllContracts, 
  getContractById, 
  updateContractById, 
  deleteContractById,
  updateContractStatus 
} from './contract.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new contract (public route - no auth needed)
router.post('/', createContract);


// Get all contracts (admin only)
router.get('/', auth('admin'), getAllContracts);

// Get a single contract by ID
router.get('/:id', auth('admin'), getContractById);

// Update a contract by ID (admin only)
router.put('/:id', auth('admin'), updateContractById);

// Delete a contract by ID (admin only)
router.delete('/:id', auth('admin'), deleteContractById);

// Update contract status (admin only)
router.patch('/:id/status', auth('admin'), updateContractStatus);

export const contractRouter = router;
