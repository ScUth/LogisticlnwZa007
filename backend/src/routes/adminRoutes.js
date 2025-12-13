import express from 'express';
import { listCouriers, getCourierDetails, updateCourierActive } from '../controllers/adminController.js';
import { authAdmin } from '../middleware/auth.js';

const router = express.Router();


/*============= COURIER ==============*/
// GET /api/admin/couriers
router.get('/couriers', authAdmin, listCouriers);

// GET /api/admin/couriers/:id
router.get('/couriers/:id', authAdmin, getCourierDetails);

// PATCH /api/admin/couriers/:id/active
router.patch('/couriers/:id/active', authAdmin, updateCourierActive);

export default router;

