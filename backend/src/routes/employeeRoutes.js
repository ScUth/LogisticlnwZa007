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

export default router;
