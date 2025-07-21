import express from 'express';

import { auth } from '../../middlewares/authMiddleware';
import { 
      addMenuBookmark, 
  removeMenuBookmark, 
  getUserBookmarks,
  checkBookmarkStatus 
 } from './bookmark.controller';
// import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

// Add menu item to bookmarks
router.post('/menu', auth('user','vendor'), addMenuBookmark);

// Remove menu item from bookmarks
router.delete('/menu/:menuItemId', auth('user','vendor'), removeMenuBookmark);

// Get user's bookmarks
router.get('/menu', auth('user','vendor'), getUserBookmarks);

// Check if menu item is bookmarked
router.get('/menu/:menuItemId/status', auth('user','vendor'), checkBookmarkStatus);

export const bookmarkRouter = router;