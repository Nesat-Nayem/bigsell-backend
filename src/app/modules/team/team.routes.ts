import express from 'express';
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } from './team.controller';
import { auth } from '../../middlewares/authMiddleware';
import { upload } from '../../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/', getTeams);
router.get('/:id', getTeamById);

// Admin routes
router.post('/', auth('admin'), upload.single('image'), createTeam);
router.put('/:id', auth('admin'), upload.single('image'), updateTeam);
router.delete('/:id', auth('admin'), deleteTeam);

export const teamRouter = router;
