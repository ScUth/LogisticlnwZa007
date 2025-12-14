import express from 'express';
import {
    listCouriers, 
    getCourierDetails, 
    updateCourierActive,
    getAllProvinces, 
    listVehicles,
    listParcels,
    listSenders,
    listRecipients,
    getVehicleByID, 
    createNewVehicle, 
    updateVehicle,
    deleteVehicle,
    getParcelByID,
    createParcel,
    updateParcel,
    createCourier,
    listProofs,
    listRoutes,
    listScanEvents,
    getProofDetail,
    listHubs,
    createHub,
    deleteHub
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

/*============= Parcel ==============*/

// GET /api/admin/parcels
router.get('/parcels', authAdmin, listParcels);

// GET /api/admin/senders
router.get('/senders', authAdmin, listSenders);

// GET /api/admin/recipients
router.get('/recipients', authAdmin, listRecipients);

// GET /api/admin/parcels/:id
router.get('/parcels/:id', authAdmin, getParcelByID);

// GET /api/admin/hubs
router.get('/hubs', authAdmin, listHubs);
// POST /api/admin/hubs
router.post('/hubs', authAdmin, createHub);
// DELETE /api/admin/hubs/:id
router.delete('/hubs/:id', authAdmin, deleteHub);

// POST /api/admin/parcels
router.post('/parcels', authAdmin, createParcel);

// PUT /api/admin/parcels/:id
router.put('/parcels/:id', authAdmin, updateParcel);

// GET /api/admin/pods
router.get('/pods', authAdmin, listProofs);

// GET /api/admin/routes
router.get('/routes', authAdmin, listRoutes);

// GET /api/admin/scan-events
router.get('/scan-events', authAdmin, listScanEvents);

/*============= POD ==============*/

// GET /api/admin/pods
router.get('/pods', authAdmin, listProofs);

// GET /api/admin/pods/:id
router.get('/pods/:id', authAdmin, getProofDetail);

export default router;

