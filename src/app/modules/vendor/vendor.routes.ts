import express from 'express'
import { applyVendor, deleteVendor, getVendorById, getVendors, updateKycStatus, updateVendor } from './vendor.controller.clean'
import { auth } from '../../middlewares/authMiddleware'

const router = express.Router()

// Public: vendor application submission
router.post('/apply', applyVendor)

// Admin: list/search/pagination
router.get('/', auth('admin'), getVendors)

// Admin: get one
router.get('/:id', auth('admin'), getVendorById)

// Admin: update fields
router.put('/:id', auth('admin'), updateVendor)

// Admin: update KYC status (approve/reject)
router.patch('/:id/status', auth('admin'), updateKycStatus)

// Admin: soft delete application
router.delete('/:id', auth('admin'), deleteVendor)

export const vendorRouter = router
