import express from 'express';
import {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/me', verifyFirebaseToken, getMe);
router.put('/profile', verifyFirebaseToken, updateProfile);
router.put('/change-password', verifyFirebaseToken, changePassword);

export default router;
