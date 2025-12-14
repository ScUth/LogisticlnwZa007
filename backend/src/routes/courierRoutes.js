import express from "express";
import {
    getCourierParcels,
    getTodaysRouteParcels,
    getParcelDetails,
} from "../controllers/courierController.js";
import { authenticate, authorizeCourier } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication and courier authorization
router.use(authenticate);
router.use(authorizeCourier);

/**
 * @route   GET /api/courier/parcels
 * @desc    Get all parcels assigned to the courier
 * @access  Private (Courier only)
 */
router.get("/parcels", async (req, res) => {
    try {
        const courierId = req.user.id; // Assuming user ID is stored in req.user
        const result = await getCourierParcels(courierId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("Error in /api/courier/parcels:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message,
        });
    }
});

/**
 * @route   GET /api/courier/route/today
 * @desc    Get today's route and parcels for delivery
 * @access  Private (Courier only)
 */
router.get("/route/today", async (req, res) => {
    try {
        const courierId = req.user.id;
        const { date } = req.query; // Optional date parameter

        const result = await getTodaysRouteParcels(courierId, date);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("Error in /api/courier/route/today:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message,
        });
    }
});

/**
 * @route   GET /api/courier/parcels/:parcelId
 * @desc    Get detailed information about a specific parcel
 * @access  Private (Courier only)
 */
router.get("/parcels/:parcelId", async (req, res) => {
    try {
        const { parcelId } = req.params;
        const courierId = req.user.id;

        const result = await getParcelDetails(parcelId, courierId);

        if (!result.success) {
            const statusCode = result.error.includes("Unauthorized") ? 403 : 404;
            return res.status(statusCode).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("Error in /api/courier/parcels/:parcelId:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message,
        });
    }
});

/**
 * @route   GET /api/courier/pickup-requests
 * @desc    Get pickup requests assigned to the courier
 * @access  Private (Courier only)
 */
router.get("/pickup-requests", async (req, res) => {
    try {
        const courierId = req.user.id;
        const { status } = req.query;

        const query = {
            assigned_courier: courierId,
        };

        if (status) {
            query.status = status;
        }

        const pickupRequests = await PickupRequest.find(query)
            .populate("requester", "first_name last_name phone")
            .sort({ updated_at: -1 });

        res.json({
            success: true,
            data: pickupRequests,
            count: pickupRequests.length,
        });
    } catch (error) {
        console.error("Error in /api/courier/pickup-requests:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message,
        });
    }
});

export default router;