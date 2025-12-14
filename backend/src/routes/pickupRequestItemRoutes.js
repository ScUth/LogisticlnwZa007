import express from 'express';
import {
  updatePickupRequestItem,
  deleteItemFromPickupRequest, 
} from '../controllers/pickupRequestController.js';
import { authSender } from '../middleware/auth.js';

const router = express.Router();

router.patch('/:itemId', authSender, updatePickupRequestItem);
router.delete('/:itemId', authSender, deleteItemFromPickupRequest);

export default router;