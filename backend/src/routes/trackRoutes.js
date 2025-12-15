import express from "express";
import { Parcel, ParcelScanEvent } from "../models/operations.js";

const router = express.Router();

/**
 * @route   GET /api/track/:trackingCode
 * @desc    Get parcel tracking information by tracking code (public)
 * @access  Public
 */
router.get("/:trackingCode", async (req, res) => {
    try {
        const { trackingCode } = req.params;

        // Find parcel by tracking code
        const parcel = await Parcel.findOne({ tracking_code: trackingCode })
            .populate("origin_hub_id", "hub_name address_text sub_district")
            .populate("dest_hub_id", "hub_name address_text sub_district")
            .lean();

        if (!parcel) {
            return res.status(404).json({
                success: false,
                error: "Parcel not found",
                message: "No parcel found with this tracking code",
            });
        }

        // Get all scan events for this parcel
        const scanEvents = await ParcelScanEvent.find({ parcel_id: parcel._id })
            .populate("hub_id", "hub_name address_text")
            .populate("courier_id", "first_name last_name employee_id")
            .sort({ event_time: 1 })
            .lean();

        // Format the response
        const trackingInfo = {
            tracking_code: parcel.tracking_code,
            status: parcel.status,
            created_at: parcel.created_at,
            delivered_at: parcel.delivered_at,
            recipient: {
                name: `${parcel.recipient.first_name} ${parcel.recipient.last_name}`,
                address: parcel.recipient.address_text,
                sub_district: parcel.recipient.sub_district,
            },
            sender: {
                name: `${parcel.sender.first_name} ${parcel.sender.last_name}`,
            },
            origin_hub: parcel.origin_hub_id ? {
                name: parcel.origin_hub_id.hub_name,
                address: parcel.origin_hub_id.address_text,
            } : null,
            dest_hub: parcel.dest_hub_id ? {
                name: parcel.dest_hub_id.hub_name,
                address: parcel.dest_hub_id.address_text,
            } : null,
            weight_grams: parcel.weight_grams,
            events: scanEvents.map(event => ({
                event_type: event.event_type,
                event_time: event.event_time,
                hub: event.hub_id ? {
                    name: event.hub_id.hub_name,
                    address: event.hub_id.address_text,
                } : null,
                courier: event.courier_id ? {
                    name: `${event.courier_id.first_name} ${event.courier_id.last_name}`,
                    employee_id: event.courier_id.employee_id,
                } : null,
                notes: event.notes,
            })),
        };

        res.json({
            success: true,
            data: trackingInfo,
        });
    } catch (error) {
        console.error("Error tracking parcel:", error);
        res.status(500).json({
            success: false,
            error: "Server error",
            details: error.message,
        });
    }
});

export default router;
