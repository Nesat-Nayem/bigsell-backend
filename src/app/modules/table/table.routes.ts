import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { 
      createTable, 
  getAllTables, 
  getTableById, 
  updateTableById, 
  deleteTableById 
 } from './table.controller';

const router = express.Router();

// Create a new table
router.post('/', auth('admin', 'vendor'), createTable);

// Get all tables (with optional active filter)
router.get('/', getAllTables);

// Get a single table by ID
router.get('/:id', auth('admin', 'vendor'), getTableById);

// Update a table by ID
router.put('/:id', auth('admin'), updateTableById);

// Delete a table by ID (soft delete)
router.delete('/:id', auth('admin'), deleteTableById);

export const tableRouter = router;
