import express from 'express';
import { listCouriers } from '../controllers/employeeController.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/couriers
router.get('/', auth, requireAdmin, listCouriers);

export default router;

