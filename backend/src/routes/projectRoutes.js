import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';
import rolemiddleware from '../middleware/rolemiddleware.js';

const router = express.Router();

// Public route
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes - admin only
router.post(
  '/',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  createProject
);

router.put(
  '/:id',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  updateProject
);

router.delete(
  '/:id',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  deleteProject
);

export default router;
