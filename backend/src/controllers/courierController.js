import mongoose from "mongoose";
import {
    Parcel,
    Route,
    PickupRequest,
    PickupRequestItem,
    ParcelRouteAssignment,
    Vehicle,
    ParcelScanEvent,
} from "../models/operations.js";

/**
 * Get all parcels assigned to a courier (for pickup and delivery)
 * @param {ObjectId} courierId - Employee ID of the courier
 * @returns {Object} - Parcels grouped by type
 */
export const getCourierParcels = async (courierId) => {
    try {
        // 1. Get pickup requests assigned to this courier
        const pickupRequests = await PickupRequest.find({
            assigned_courier: courierId,
            status: { $in: ["assigned", "in_progress"] },
        }).sort({ updated_at: -1 });

        // Get parcels from pickup request items
        const pickupRequestIds = pickupRequests.map((req) => req._id);
        const pickupRequestItems = await PickupRequestItem.find({
            request_id: { $in: pickupRequestIds },
            status: { $in: ["confirmed", "parcel_created"] },
        }).populate("parcel_id");

        // 2. Get active routes for this courier
        const activeRoutes = await Route.find({
            courier_id: courierId,
            status: { $in: ["planned", "out_for_delivery"] },
        });

        const routeIds = activeRoutes.map((route) => route._id);

        // Get parcels assigned to these routes
        const routeAssignments = await ParcelRouteAssignment.find({
            route_id: { $in: routeIds },
            active: true,
        })
            .populate({
                path: "parcel_id",
                match: { status: { $ne: "delivered" } },
            })
            .populate("route_id");

        // Filter out null parcels
        const activeParcels = routeAssignments
            .filter((assignment) => assignment.parcel_id)
            .map((assignment) => ({
                parcel: assignment.parcel_id,
                route: assignment.route_id,
                assignment_type: "delivery",
            }));

        // 3. Get courier's vehicle (if assigned)
        const vehicle = await Vehicle.findOne({
            assigned_courier: courierId,
        });

        // Group parcels by status/type
        const groupedParcels = {
            forPickup: [], // Parcels waiting to be picked up
            inTransit: [], // Parcels currently with courier
            forDelivery: [], // Parcels assigned for delivery
        };

        // Process pickup request items
        pickupRequestItems.forEach((item) => {
            if (item.parcel_id) {
                // Already has a parcel created
                groupedParcels.forPickup.push({
                    ...item.parcel_id.toObject(),
                    pickup_request_item: item._id,
                    pickup_request: item.request_id,
                    task_type: "pickup",
                    estimated_weight: item.estimated_weight,
                    size: item.size,
                });
            } else {
                // No parcel created yet - just the request item
                groupedParcels.forPickup.push({
                    _id: item._id,
                    recipient: item.recipient,
                    estimated_weight: item.estimated_weight,
                    quantity: item.quantity,
                    size: item.size,
                    status: "pending_pickup",
                    task_type: "pickup",
                    pickup_request: item.request_id,
                });
            }
        });

        // Process delivery parcels
        activeParcels.forEach((item) => {
            const parcel = item.parcel;
            const route = item.route;

            const parcelData = {
                ...parcel.toObject(),
                route_id: route._id,
                route_date: route.route_date,
                route_status: route.status,
                task_type: "delivery",
            };

            // Categorize based on parcel status
            if (parcel.status === "out_for_delivery") {
                groupedParcels.forDelivery.push(parcelData);
            } else {
                groupedParcels.inTransit.push(parcelData);
            }
        });

        return {
            success: true,
            data: {
                groupedParcels,
                vehicle: vehicle || null,
                stats: {
                    totalForPickup: groupedParcels.forPickup.length,
                    totalInTransit: groupedParcels.inTransit.length,
                    totalForDelivery: groupedParcels.forDelivery.length,
                    total: groupedParcels.forPickup.length +
                        groupedParcels.inTransit.length +
                        groupedParcels.forDelivery.length,
                },
            },
        };
    } catch (error) {
        console.error("Error getting courier parcels:", error);
        return {
            success: false,
            error: "Failed to fetch courier parcels",
            details: error.message,
        };
    }
};

/**
 * Get parcels for a specific route (simplified version)
 * @param {ObjectId} courierId - Employee ID
 * @param {Date} date - Optional date filter
 * @returns {Object} - Parcels for today's route
 */
export const getTodaysRouteParcels = async (courierId, date = null) => {
    try {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Find today's route
        const route = await Route.findOne({
            courier_id: courierId,
            route_date: {
                $gte: targetDate,
                $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
            },
            status: { $in: ["planned", "out_for_delivery"] },
        });

        if (!route) {
            return {
                success: true,
                data: {
                    route: null,
                    parcels: [],
                    message: "No route scheduled for today",
                },
            };
        }

        // Get parcels for this route
        const assignments = await ParcelRouteAssignment.find({
            route_id: route._id,
            active: true,
        }).populate({
            path: "parcel_id",
            match: { status: { $nin: ["delivered", "canceled"] } },
        });

        const parcels = assignments
            .filter((a) => a.parcel_id)
            .map((a) => ({
                ...a.parcel_id.toObject(),
                assignment_id: a._id,
                assigned_at: a.assigned_at,
            }));

        return {
            success: true,
            data: {
                route,
                parcels,
                stats: {
                    total: parcels.length,
                    readyForDelivery: parcels.filter(p => p.status === "at_dest_hub").length,
                    outForDelivery: parcels.filter(p => p.status === "out_for_delivery").length,
                },
            },
        };
    } catch (error) {
        console.error("Error getting today's route:", error);
        return {
            success: false,
            error: "Failed to fetch today's route",
            details: error.message,
        };
    }
};

/**
 * Get parcel details with tracking history
 * @param {ObjectId} parcelId - Parcel ID
 * @param {ObjectId} courierId - Courier ID (for authorization check)
 * @returns {Object} - Parcel details with history
 */
export const getParcelDetails = async (parcelId, courierId) => {
    try {
        // Check if courier has access to this parcel
        const hasAccess = await checkCourierAccessToParcel(parcelId, courierId);

        if (!hasAccess) {
            return {
                success: false,
                error: "Unauthorized access to this parcel",
            };
        }

        const parcel = await Parcel.findById(parcelId)
            .populate("origin_hub_id", "name address_text")
            .populate("dest_hub_id", "name address_text");

        if (!parcel) {
            return {
                success: false,
                error: "Parcel not found",
            };
        }

        // Get tracking history
        const trackingHistory = await ParcelScanEvent.find({ parcel_id: parcelId })
            .populate("hub_id", "name")
            .populate("courier_id", "first_name last_name")
            .sort({ event_time: 1 });

        return {
            success: true,
            data: {
                parcel,
                trackingHistory,
                nextActions: getAvailableActions(parcel.status),
            },
        };
    } catch (error) {
        console.error("Error getting parcel details:", error);
        return {
            success: false,
            error: "Failed to fetch parcel details",
            details: error.message,
        };
    }
};

/**
 * List pickup requests that are pending and not yet assigned to any courier.
 * Used by couriers to see available work before accepting.
 */
export const getAvailablePickupRequests = async () => {
    try {
        const pickupRequests = await PickupRequest.find({
            status: "pending",
            $or: [
                { assigned_courier: null },
                { assigned_courier: { $exists: false } },
            ],
        })
            .populate("requester", "first_name last_name phone")
            .sort({ requested_at: -1 });

        const requestIds = pickupRequests.map((req) => req._id);

        const items = await PickupRequestItem.find({
            request_id: { $in: requestIds },
        }).sort({ created_at: -1 });

        const itemsByRequest = items.reduce((acc, item) => {
            const key = item.request_id.toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        const requestsWithItems = pickupRequests.map((req) => ({
            request: req,
            items: itemsByRequest[req._id.toString()] || [],
        }));

        return {
            success: true,
            data: {
                requests: requestsWithItems,
                count: requestsWithItems.length,
            },
        };
    } catch (error) {
        console.error("Error getting available pickup requests:", error);
        return {
            success: false,
            error: "Failed to fetch available pickup requests",
            details: error.message,
        };
    }
};

/**
 * Courier accepts a pickup request and selects a vehicle for pickup.
 * - Only pending, unassigned requests can be accepted.
 * - Vehicle must either already belong to the courier or be unassigned.
 */
export const acceptPickupRequestForCourier = async (courierId, requestId, vehicleId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return {
                success: false,
                error: "Invalid request id",
            };
        }

        const pickupRequest = await PickupRequest.findById(requestId);

        if (!pickupRequest) {
            return {
                success: false,
                error: "Pickup request not found",
            };
        }

        if (pickupRequest.status !== "pending") {
            return {
                success: false,
                error: "Only pending pickup requests can be accepted",
            };
        }

        if (pickupRequest.assigned_courier) {
            return {
                success: false,
                error: "Pickup request is already assigned to a courier",
            };
        }

        if (!vehicleId || !mongoose.Types.ObjectId.isValid(vehicleId)) {
            return {
                success: false,
                error: "A valid vehicle must be selected to accept this request",
            };
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return {
                success: false,
                error: "Selected vehicle not found",
            };
        }

        // Vehicle must either already be assigned to this courier or be unassigned company vehicle
        if (
            vehicle.assigned_courier &&
            !vehicle.assigned_courier.equals(courierId)
        ) {
            return {
                success: false,
                error: "Selected vehicle is assigned to another courier",
            };
        }

        // If vehicle is unassigned, assign it to this courier
        if (!vehicle.assigned_courier) {
            vehicle.assigned_courier = courierId;
            await vehicle.save();
        }

        pickupRequest.assigned_courier = courierId;
        pickupRequest.status = "assigned";
        await pickupRequest.save();

        return {
            success: true,
            data: {
                request: pickupRequest,
                vehicle,
            },
        };
    } catch (error) {
        console.error("Error accepting pickup request:", error);
        return {
            success: false,
            error: "Failed to accept pickup request",
            details: error.message,
        };
    }
};

// Helper function to check if courier has access to a parcel
async function checkCourierAccessToParcel(parcelId, courierId) {
    try {
        // Check through pickup requests
        const pickupRequestItem = await PickupRequestItem.findOne({
            parcel_id: parcelId,
        }).populate("request_id");

        if (pickupRequestItem?.request_id?.assigned_courier?.equals(courierId)) {
            return true;
        }

        // Check through route assignments
        const routeAssignment = await ParcelRouteAssignment.findOne({
            parcel_id: parcelId,
            active: true,
        }).populate("route_id");

        if (routeAssignment?.route_id?.courier_id?.equals(courierId)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error checking courier access:", error);
        return false;
    }
}

// Helper function to determine available actions based on parcel status
function getAvailableActions(status) {
    const actions = {
        picked_up: ["scan_to_hub", "mark_damaged"],
        at_origin_hub: ["depart_hub", "mark_damaged"],
        in_linehaul: ["arrive_at_dest_hub", "mark_damaged"],
        at_dest_hub: ["prepare_for_delivery", "mark_damaged"],
        out_for_delivery: [
            "deliver",
            "failed_delivery",
            "reschedule",
            "mark_damaged",
        ],
        failed_delivery: ["retry_delivery", "return_to_sender"],
    };

    return actions[status] || [];
}