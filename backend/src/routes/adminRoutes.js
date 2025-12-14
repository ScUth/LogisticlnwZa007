import express from 'express';
import {
    listCouriers, 
    getCourierDetails, 
    updateCourierActive,
    getAllProvinces, 
    listVehicles,
    getVehicleByID, 
    createNewVehicle, 
    updateVehicle,
    deleteVehicle,
    createCourier,
} from '../controllers/adminController.js';
import { authAdmin } from '../middleware/auth.js';

const router = express.Router();


/*============= COURIER ==============*/
// GET /api/admin/couriers
router.get('/couriers', authAdmin, listCouriers);

// GET /api/admin/couriers/:id
router.get('/couriers/:id', authAdmin, getCourierDetails);

// PATCH /api/admin/couriers/:id/active
router.patch('/couriers/:id/active', authAdmin, updateCourierActive);

// POST /api/admin/couriers
router.post("/couriers", authAdmin, createCourier);

/*============= Vehicle ==============*/
// GET /api/admin/vehicles/provinces
router.get('/vehicles/provinces', authAdmin, getAllProvinces);

// GET /api/admin/vehicles
router.get('/vehicles', authAdmin, listVehicles);

// GET /api/admin/vehicles/:id
router.get("/vehicles/:id", authAdmin, getVehicleByID);

// POST /api/admin/vehicles
router.post("/vehicles", authAdmin, createNewVehicle);

// PUT /api/admin/vehicles/:id
router.put("/vehicles/:id", authAdmin, updateVehicle);

// DELETE /api/admin/vehicles/:id
router.delete("/vehicles/:id", authAdmin, deleteVehicle);

export default router;

