import express from 'express';
import {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  assignVolunteer,
  deleteVolunteer
} from '../controllers/volunteerController.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';
import rolemiddleware from '../middleware/rolemiddleware.js';

const router = express.Router();

// Public route - anyone can apply to volunteer
router.post('/', createVolunteer);

// Protected routes
router.get('/', verifyFirebaseToken, rolemiddleware('admin'), getVolunteers);
router.get('/:id', verifyFirebaseToken, rolemiddleware('admin'), getVolunteer);
router.put('/:id', verifyFirebaseToken, rolemiddleware('admin'), updateVolunteer);
router.post('/:id/assign', verifyFirebaseToken, rolemiddleware('admin'), assignVolunteer);
router.delete('/:id', verifyFirebaseToken, rolemiddleware('admin'), deleteVolunteer);

export default router;
