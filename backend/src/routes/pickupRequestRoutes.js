import express from 'express';
import {
  listPickupRequestsForSender,
  getOrCreateDraftPickupRequest,
  addItemToPickupRequest,
  submitPickupRequest,
  getPickupRequestItems, 
} from '../controllers/pickupRequestController.js';
import { authSender } from '../middleware/auth.js';

const router = express.Router();

// List all pickup requests for current sender (history)
router.get('/', authSender, listPickupRequestsForSender);

router.post('/draft', authSender, getOrCreateDraftPickupRequest);
router.post('/:requestId/submit', authSender, submitPickupRequest);
router.post('/:requestId/items', authSender, addItemToPickupRequest);
router.get('/:requestId/items', authSender, getPickupRequestItems);

export default router;
