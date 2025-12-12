import express from 'express';
import {
  createLocation,
  getLocationsBySender,
  getLocationById,
  updateLocation,
  getUsedLocationBySender,
} from '../controllers/locationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createLocation);
router.get('/sender/:senderId', auth, getLocationsBySender);
router.get('/sender/:senderId/used', auth, getUsedLocationBySender);
router.get('/:locationId', auth, getLocationById);
router.patch('/:locationId', auth, updateLocation);

export default router;