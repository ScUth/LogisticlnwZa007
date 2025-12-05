import express from 'express';
import {
  createLocation,
  getLocationsBySender,
  getLocationById,
  updateLocation,
} from '../controllers/locationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createLocation);
router.get('/sender/:senderId', authenticate, getLocationsBySender);
router.get('/:locationId', authenticate, getLocationById);
router.patch('/:locationId', authenticate, updateLocation);

export default router;