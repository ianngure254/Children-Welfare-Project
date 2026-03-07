import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getMe,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes - Admin only
router.post('/register', protect, restrictTo('super_admin'), registerAdmin);
router.post('/logout', protect, logoutAdmin);
router.get('/me', protect, restrictTo('admin', 'super_admin'), getMe);

// Admin management routes - Super admin only
router.get('/', protect, restrictTo('super_admin'), getAdmins);
router.get('/:id', protect, restrictTo('super_admin'), getAdmin);
router.put('/:id', protect, restrictTo('super_admin'), updateAdmin);
router.delete('/:id', protect, restrictTo('super_admin'), deleteAdmin);

export default router;