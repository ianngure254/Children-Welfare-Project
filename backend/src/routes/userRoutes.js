import express from 'express';
import {
  getUser,
  getUserByFirebaseUid,
  getUserByEmail,
  getAllUsers,
  updateUserRole,
  syncFirebaseUser,
  createUserFromFirebase
} from '../controllers/userController.js';
import verifyFirebaseToken, { verifyFirebaseTokenForSync } from '../middleware/verifyFirebaseToken.js';
import rolemiddleware from '../middleware/rolemiddleware.js';

const router = express.Router();

// Public routes — no auth needed
router.post('/create-from-firebase', createUserFromFirebase);
router.get('/email/:email', getUserByEmail);
router.get('/firebase/:firebaseUid', getUserByFirebaseUid);
router.get('/:userId', getUser);

// Sync route — uses special middleware that allows new users through
router.post('/sync', verifyFirebaseTokenForSync, syncFirebaseUser);

// Protected admin routes
router.get('/', verifyFirebaseToken, rolemiddleware('admin', 'super_admin'), getAllUsers);
router.put('/:userId/role', verifyFirebaseToken, rolemiddleware('admin', 'super_admin'), updateUserRole);

export default router;
