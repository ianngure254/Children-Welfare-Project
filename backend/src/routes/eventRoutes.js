import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent
} from '../controllers/eventController.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';
import rolemiddleware from '../middleware/rolemiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/:id/register', registerForEvent);

// Protected routes - admin only
router.post(
  '/',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  createEvent
);

router.put(
  '/:id',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  updateEvent
);

router.delete(
  '/:id',
  verifyFirebaseToken,
  rolemiddleware('admin', 'super_admin'),
  deleteEvent
);

export default router;
