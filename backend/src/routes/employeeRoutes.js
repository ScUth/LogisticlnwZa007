import express from 'express';
import { authEmployee } from '../middleware/auth.js';
import { getCourierParcels, getParcelDetails, deliverParcel, failParcel, getTodaysRouteParcels, getOpenRoutes, acceptRoute, getAssignedPickups } from '../controllers/courierController.js';

const router = express.Router();

router.use(authEmployee);

router.get('/parcels', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const result = await getCourierParcels(courierId);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/parcels', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

router.get('/parcels/:parcelId', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const { parcelId } = req.params;
        const result = await getParcelDetails(parcelId, courierId);
        if (!result.success) return res.status(403).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/parcels/:id', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

router.post('/parcels/:parcelId/deliver', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const { parcelId } = req.params;
        const payload = req.body || {};
        const result = await deliverParcel(parcelId, courierId, payload);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/parcels/:id/deliver', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

router.post('/parcels/:parcelId/fail', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const { parcelId } = req.params;
        const payload = req.body || {};
        const result = await failParcel(parcelId, courierId, payload);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/parcels/:id/fail', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

router.get('/route/today', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const date = req.query.date || null;
        const result = await getTodaysRouteParcels(courierId, date);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/route/today', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// GET /api/employee/routes/open - list routes with no courier assigned
router.get('/routes/open', async (req, res) => {
    try {
        const result = await getOpenRoutes();
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/routes/open', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// POST /api/employee/routes/:routeId/accept - accept an open route
router.post('/routes/:routeId/accept', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const { routeId } = req.params;
        const result = await acceptRoute(routeId, courierId);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/routes/:routeId/accept', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// POST /api/employee/routes/:routeId/start - start a route
import { startRoute } from '../controllers/courierController.js';
router.post('/routes/:routeId/start', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const { routeId } = req.params;
        const result = await startRoute(routeId, courierId);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/routes/:routeId/start', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// GET /api/employee/pickups - pickup requests assigned to courier
router.get('/pickups', async (req, res) => {
    try {
        const courierId = req.auth.id;
        const result = await getAssignedPickups(courierId);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/pickups', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// GET /api/employee/hubs/:id - fetch hub details for employee UI
import { getHubById as adminGetHubById } from '../controllers/adminController.js';
router.get('/hubs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Reuse admin controller helper to fetch hub by id and return same shape
        const fakeReq = { params: { id } };
        const fakeRes = {
            status: (code) => ({ json: (obj) => res.status(code).json(obj) }),
            json: (obj) => res.json(obj)
        };
        return adminGetHubById(fakeReq, fakeRes);
    } catch (err) {
        console.error('/api/employee/hubs/:id', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// GET /api/employee/hubs/:id/parcels - list parcels related to a hub
import { getParcelsForHub, createHubScanEvent } from '../controllers/courierController.js';
import { Employee } from '../models/people.js';
router.get('/hubs/:id/parcels', async (req, res) => {
    try {
        const { id } = req.params;
        // only staff assigned to this hub may query
        const emp = await Employee.findById(req.auth.id).select('role current_hub');
        if (!emp || emp.role !== 'staff' || String(emp.current_hub) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const result = await getParcelsForHub(id);
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/hubs/:id/parcels', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// POST /api/employee/hubs/:id/scan-events - create a scan event for a parcel at this hub (staff)
router.post('/hubs/:id/scan-events', async (req, res) => {
    try {
        const { id } = req.params;
        // only staff assigned to this hub may create events
        const emp = await Employee.findById(req.auth.id).select('role current_hub');
        if (!emp || emp.role !== 'staff' || String(emp.current_hub) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { parcel_id, courier_id, event_type, notes } = req.body || {};
        const result = await createHubScanEvent(id, { parcel_id, courier_id, event_type, notes });
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/hubs/:id/scan-events', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

// POST /api/employee/hubs/:id/process-parcel - smart parcel processing (linehaul, delivery assignment)
import { processParcelAtHub } from '../controllers/courierController.js';
router.post('/hubs/:id/process-parcel', async (req, res) => {
    try {
        const { id } = req.params;
        // only staff assigned to this hub may process parcels
        const emp = await Employee.findById(req.auth.id).select('role current_hub');
        if (!emp || emp.role !== 'staff' || String(emp.current_hub) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { parcel_id, action, courier_id, notes } = req.body || {};
        if (!parcel_id || !action) {
            return res.status(400).json({ success: false, error: 'parcel_id and action are required' });
        }

        const result = await processParcelAtHub(id, parcel_id, action, { courier_id, notes });
        if (!result.success) return res.status(400).json(result);
        res.json(result);
    } catch (err) {
        console.error('/api/employee/hubs/:id/process-parcel', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});


export default router;
