import mongoose from "mongoose";
import {
    Parcel,
    Route,
    PickupRequest,
    PickupRequestItem,
    ParcelRouteAssignment,
    Vehicle,
    ParcelScanEvent,
    ProofOfDelivery,
} from "../models/operations.js";
import { Sender } from "../models/people.js";
import { Hub } from "../models/location.js";

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
            status: { $in: ["confirmed", "parcel_created"] }, // confirmed = need to create, parcel_created = track delivery
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
            // Check if parcels have been created (status=parcel_created and parcel_id exists)
            if (item.status === "parcel_created" && item.parcel_id) {
                // Parcel has been created - add to inTransit for tracking to hub
                const parcelObj = item.parcel_id.toObject();
                groupedParcels.inTransit.push({
                    ...parcelObj,
                    pickup_request_item: item._id,
                    pickup_request: item.request_id,
                    task_type: "pickup",
                    estimated_weight: item.estimated_weight,
                    size: item.size,
                });
            } else if (item.status === "confirmed") {
                // No parcel created yet - show in forPickup to create parcels
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
        }).populate('hub_id', 'hub_name address_text').lean();

        if (route && route.hub_id) route.hub_id.name = route.hub_id.hub_name;

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
 * Get open routes (no courier assigned)
 */
export const getOpenRoutes = async () => {
    try {
        const routes = await Route.find({ courier_id: null, status: { $in: ['planned'] } })
            .populate('hub_id', 'hub_name address_text')
            .sort({ route_date: 1 })
            .lean();

        // alias hub_name -> name to keep frontend usage unchanged
        const routesWithName = routes.map(r => ({
            ...r,
            hub_id: r.hub_id ? { ...r.hub_id, name: r.hub_id.hub_name } : null,
        }));

        return { success: true, data: { routes: routesWithName } };
    } catch (error) {
        console.error('Error getting open routes:', error);
        return { success: false, error: 'Failed to fetch open routes', details: error.message };
    }
};

/**
 * Start a route - update route status and parcel statuses
 * @param {ObjectId} routeId - Route ID
 * @param {ObjectId} courierId - Courier ID
 * @returns {Object} - Result object
 */
export const startRoute = async (routeId, courierId) => {
    try {
        const route = await Route.findById(routeId);
        if (!route) return { success: false, error: 'Route not found' };
        
        // Verify courier owns this route
        if (!route.courier_id || route.courier_id.toString() !== courierId.toString()) {
            return { success: false, error: 'You are not assigned to this route' };
        }

        if (route.status !== 'planned') {
            return { success: false, error: `Route cannot be started. Current status: ${route.status}` };
        }

        // Update route status
        route.status = 'out_for_delivery';
        route.started_at = new Date();
        await route.save();

        // Get all parcels assigned to this route
        const assignments = await ParcelRouteAssignment.find({
            route_id: routeId,
            active: true,
        });

        const parcelIds = assignments.map(a => a.parcel_id);
        
        // Update all parcels to out_for_delivery status
        await Parcel.updateMany(
            { 
                _id: { $in: parcelIds },
                status: 'at_dest_hub' // Only update parcels that are ready at destination hub
            },
            { status: 'out_for_delivery' }
        );

        // Create scan events for each parcel
        const scanEvents = parcelIds.map(parcelId => ({
            parcel_id: parcelId,
            courier_id: courierId,
            event_type: 'out_for_delivery',
            event_time: new Date(),
            notes: `Courier started delivery route`
        }));

        await ParcelScanEvent.insertMany(scanEvents);

        return {
            success: true,
            data: {
                route,
                updatedParcels: parcelIds.length,
                message: 'Route started successfully'
            }
        };
    } catch (error) {
        console.error('Error starting route:', error);
        return { success: false, error: 'Failed to start route', details: error.message };
    }
};

/**
 * Courier accepts a route (set courier_id if not set)
 */
export const acceptRoute = async (routeId, courierId) => {
    try {
        const route = await Route.findById(routeId);
        if (!route) return { success: false, error: 'Route not found' };
        if (route.courier_id) return { success: false, error: 'Route already assigned' };

        route.courier_id = courierId;
        await route.save();

        return { success: true, data: { route } };
    } catch (error) {
        console.error('Error accepting route:', error);
        return { success: false, error: 'Failed to accept route', details: error.message };
    }
};

/**
 * Get pickup requests assigned to courier (for employee view)
 */
export const getAssignedPickups = async (courierId) => {
    try {
        const pickups = await PickupRequest.find({ assigned_courier: courierId })
            .populate('requester', 'first_name last_name phone')
            .sort({ updated_at: -1 })
            .lean();
        return { success: true, data: { pickups } };
    } catch (error) {
        console.error('Error getting assigned pickups:', error);
        return { success: false, error: 'Failed to fetch pickups', details: error.message };
    }
};

// GET parcels for a hub (origin or destination match)
export const getParcelsForHub = async (hubId) => {
    try {
        if (!hubId) return { success: false, error: 'hubId required' };
        const parcels = await Parcel.find({
            $or: [ { origin_hub_id: hubId }, { dest_hub_id: hubId } ]
        })
        .select('tracking_code status origin_hub_id dest_hub_id created_at updated_at')
        .populate('origin_hub_id', 'hub_name')
        .populate('dest_hub_id', 'hub_name')
        .sort({ updated_at: -1 })
        .lean();

        const mapped = parcels.map(p => ({
            ...p,
            origin_hub: p.origin_hub_id ? { _id: p.origin_hub_id._id, name: p.origin_hub_id.hub_name } : null,
            dest_hub: p.dest_hub_id ? { _id: p.dest_hub_id._id, name: p.dest_hub_id.hub_name } : null,
        }));

        return { success: true, data: { parcels: mapped } };
    } catch (err) {
        console.error('Error fetching parcels for hub:', err);
        return { success: false, error: 'Failed to fetch parcels', details: err.message };
    }
};

// Create a ParcelScanEvent for a hub (staff action)
export const createHubScanEvent = async (hubId, { parcel_id, courier_id, event_type, notes } = {}) => {
    try {
        if (!hubId || !parcel_id || !event_type) return { success: false, error: 'hubId, parcel_id and event_type are required' };

        // validate parcel belongs to this hub
        const parcel = await Parcel.findById(parcel_id);
        if (!parcel) return { success: false, error: 'Parcel not found' };

        const matchesHub = String(parcel.origin_hub_id) === String(hubId) || String(parcel.dest_hub_id) === String(hubId);
        if (!matchesHub) return { success: false, error: 'Parcel does not belong to this hub' };

        const event = await ParcelScanEvent.create({
            parcel_id: parcel._id,
            hub_id: hubId,
            courier_id: courier_id || null,
            event_type,
            event_time: new Date(),
            notes: notes || ''
        });

        return { success: true, data: { event } };
    } catch (err) {
        console.error('Error creating hub scan event:', err);
        return { success: false, error: 'Failed to create scan event', details: err.message };
    }
};

/**
 * Process parcel at hub - determines next action based on hub location and parcel status
 * @param {ObjectId} hubId - Current hub ID
 * @param {ObjectId} parcelId - Parcel ID
 * @param {String} action - Action to perform: 'send_to_linehaul', 'prepare_for_delivery', 'confirm_arrival'
 * @param {Object} options - Additional options (courier_id, notes)
 */
export const processParcelAtHub = async (hubId, parcelId, action, options = {}) => {
    try {
        const parcel = await Parcel.findById(parcelId).populate('origin_hub_id dest_hub_id');
        if (!parcel) return { success: false, error: 'Parcel not found' };

        const isOriginHub = String(parcel.origin_hub_id._id) === String(hubId);
        const isDestHub = String(parcel.dest_hub_id._id) === String(hubId);
        
        if (!isOriginHub && !isDestHub) {
            return { success: false, error: 'This hub is neither origin nor destination for this parcel' };
        }

        let newStatus, eventType, eventNotes;

        switch (action) {
            case 'send_to_linehaul':
                // Staff at origin hub sending parcel to linehaul (towards dest hub)
                if (!isOriginHub) {
                    return { success: false, error: 'Can only send to linehaul from origin hub' };
                }
                if (parcel.status !== 'at_origin_hub') {
                    return { success: false, error: `Cannot send to linehaul. Current status: ${parcel.status}` };
                }
                newStatus = 'in_linehaul';
                eventType = 'departed_hub';
                eventNotes = options.notes || `Departed from ${parcel.origin_hub_id.hub_name} to ${parcel.dest_hub_id.hub_name}`;
                break;

            case 'prepare_for_delivery':
                // Staff at destination hub preparing parcel for local delivery
                if (!isDestHub) {
                    return { success: false, error: 'Can only prepare for delivery at destination hub' };
                }
                if (parcel.status !== 'at_dest_hub' && parcel.status !== 'at_origin_hub') {
                    return { success: false, error: `Cannot prepare for delivery. Current status: ${parcel.status}` };
                }
                
                // Create or find today's route for this hub
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let route = await Route.findOne({
                    hub_id: hubId,
                    route_date: today,
                    status: { $in: ['planned', 'out_for_delivery'] }
                });
                
                if (!route) {
                    // Create a new route for today
                    route = await Route.create({
                        hub_id: hubId,
                        route_date: today,
                        status: 'planned'
                    });
                }
                
                // Check if parcel already assigned to this route
                const existingAssignment = await ParcelRouteAssignment.findOne({
                    parcel_id: parcelId,
                    route_id: route._id,
                    active: true
                });
                
                if (!existingAssignment) {
                    // Deactivate any other active assignments
                    await ParcelRouteAssignment.updateMany(
                        { parcel_id: parcelId, active: true },
                        { active: false }
                    );
                    
                    // Create new assignment
                    await ParcelRouteAssignment.create({
                        parcel_id: parcelId,
                        route_id: route._id,
                        active: true
                    });
                }
                
                newStatus = 'at_dest_hub'; // Keep at dest hub until courier picks up
                eventType = 'arrived_hub';
                eventNotes = options.notes || `Prepared for delivery at ${parcel.dest_hub_id.hub_name}`;
                break;

            case 'confirm_arrival':
                // Staff confirming parcel arrived at their hub from linehaul
                if (parcel.status !== 'in_linehaul') {
                    return { success: false, error: `Cannot confirm arrival. Current status: ${parcel.status}` };
                }
                if (!isDestHub) {
                    return { success: false, error: 'Parcel should arrive at destination hub' };
                }
                newStatus = 'at_dest_hub';
                eventType = 'arrived_hub';
                eventNotes = options.notes || `Arrived at ${parcel.dest_hub_id.hub_name}`;
                break;

            default:
                return { success: false, error: 'Invalid action' };
        }

        // Update parcel status
        parcel.status = newStatus;
        await parcel.save();

        // Create scan event
        const scanEvent = await ParcelScanEvent.create({
            parcel_id: parcelId,
            hub_id: hubId,
            courier_id: options.courier_id || null,
            event_type: eventType,
            event_time: new Date(),
            notes: eventNotes
        });

        return {
            success: true,
            data: {
                parcel,
                scanEvent,
                message: `Parcel ${action.replace(/_/g, ' ')} successfully`
            }
        };
    } catch (err) {
        console.error('Error processing parcel at hub:', err);
        return { success: false, error: 'Failed to process parcel', details: err.message };
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
            .populate("origin_hub_id", "hub_name address_text")
            .populate("dest_hub_id", "hub_name address_text");

        if (!parcel) {
            return {
                success: false,
                error: "Parcel not found",
            };
        }

        // Get tracking history
        const trackingHistory = await ParcelScanEvent.find({ parcel_id: parcelId })
            .populate("hub_id", "hub_name")
            .populate("courier_id", "first_name last_name")
            .sort({ event_time: 1 })
            .lean();

        // alias hub_name -> name on tracking events
        const trackingHistoryWithName = trackingHistory.map(e => ({
            ...e,
            hub_id: e.hub_id ? { ...e.hub_id, name: e.hub_id.hub_name } : null,
        }));

        // also alias origin/dest hub names for frontend convenience
        if (parcel.origin_hub_id) parcel.origin_hub_id.name = parcel.origin_hub_id.hub_name;
        if (parcel.dest_hub_id) parcel.dest_hub_id.name = parcel.dest_hub_id.hub_name;

        return {
            success: true,
            data: {
                parcel,
                trackingHistory: trackingHistoryWithName,
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
 * Mark a parcel as delivered by courier
 */
export const deliverParcel = async (parcelId, courierId, { recipient_name, notes, signature_url, photo_url } = {}) => {
    try {
        const hasAccess = await checkCourierAccessToParcel(parcelId, courierId);
        if (!hasAccess) return { success: false, error: 'Unauthorized access to this parcel' };

        const parcel = await Parcel.findById(parcelId);
        if (!parcel) return { success: false, error: 'Parcel not found' };

        parcel.status = 'delivered';
        parcel.delivered_at = new Date();
        await parcel.save();

        // create ParcelScanEvent
        await ParcelScanEvent.create({ parcel_id: parcel._id, courier_id: courierId, event_type: 'delivered', event_time: new Date(), notes });

        // create ProofOfDelivery record
        await ProofOfDelivery.create({ parcel_id: parcel._id, courier_id: courierId, recipient_name: recipient_name || '', signed_at: new Date(), signature_url, photo_url, notes });

        return { success: true, data: { parcel } };
    } catch (error) {
        console.error('Error delivering parcel:', error);
        return { success: false, error: 'Failed to mark parcel as delivered', details: error.message };
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
 * Mark a parcel as failed delivery
 */
export const failParcel = async (parcelId, courierId, { reason } = {}) => {
    try {
        const hasAccess = await checkCourierAccessToParcel(parcelId, courierId);
        if (!hasAccess) return { success: false, error: 'Unauthorized access to this parcel' };

        const parcel = await Parcel.findById(parcelId);
        if (!parcel) return { success: false, error: 'Parcel not found' };

        parcel.status = 'failed_delivery';
        await parcel.save();

        // create ParcelScanEvent
        await ParcelScanEvent.create({ parcel_id: parcel._id, courier_id: courierId, event_type: 'failed_delivery', event_time: new Date(), notes: reason });

        return { success: true, data: { parcel } };
    } catch (error) {
        console.error('Error marking parcel failed:', error);
        return { success: false, error: 'Failed to mark parcel as failed', details: error.message };
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

        // Vehicle must either already be assigned to this courier or be unassigned.
        // Use string comparison to avoid errors if assigned_courier is stored as
        // a plain ObjectId or string.
        if (
            vehicle.assigned_courier &&
            vehicle.assigned_courier.toString() !== courierId.toString()
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

/**
 * Courier confirms a pickup request item by creating concrete Parcel records.
 * - One PickupRequestItem with quantity N fans out to N Parcel documents.
 * - Only the assigned courier can perform this action.
 * - After creation, the item status becomes "parcel_created" and parcel_ids is filled.
 */
export const confirmPickupItemParcels = async (courierId, itemId, parcelsPayload = []) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return { success: false, error: "Invalid item id" };
        }

        const item = await PickupRequestItem.findById(itemId).populate("request_id");

        if (!item) {
            return { success: false, error: "Pickup request item not found" };
        }

        const request = item.request_id;
        if (!request) {
            return { success: false, error: "Parent pickup request not found" };
        }

        // Only the courier assigned to this request can confirm
        if (!request.assigned_courier || request.assigned_courier.toString() !== courierId.toString()) {
            return { success: false, error: "You are not assigned to this pickup request" };
        }

        // If this item was already converted to parcels, make the
        // operation idempotent and return existing parcels instead of
        // attempting to create duplicates (which would violate the
        // unique tracking_code index).
        if (item.status === "parcel_created" && Array.isArray(item.parcel_ids) && item.parcel_ids.length > 0) {
            const existingParcels = await Parcel.find({ _id: { $in: item.parcel_ids } });
            return {
                success: true,
                data: {
                    item,
                    parcels: existingParcels,
                    alreadyConfirmed: true,
                },
            };
        }

        if (!Array.isArray(parcelsPayload) || parcelsPayload.length === 0) {
            return { success: false, error: "Parcels payload is required" };
        }

        // Allow courier to confirm fewer parcels than originally requested
        // (e.g. customer cancels some units). We only require that the
        // number of confirmed parcels does not exceed the original quantity.
        if (parcelsPayload.length > item.quantity) {
            return {
                success: false,
                error: `Cannot create more than ${item.quantity} parcels for this item`,
            };
        }

        // Load sender to populate Parcel.sender block
        const sender = await Sender.findById(request.requester).lean();
        if (!sender) {
            return { success: false, error: "Sender for this pickup request not found" };
        }

        // Find origin hub by matching pickup location sub_district
        const pickupSubDistrict = request.pickup_location?.sub_district;
        const originHub = pickupSubDistrict
            ? await Hub.findOne({ sub_district: pickupSubDistrict, active: true }).lean()
            : null;

        if (!originHub) {
            return {
                success: false,
                error: `No active hub found for pickup sub-district: ${pickupSubDistrict || "N/A"}`,
            };
        }

        const createdParcels = [];

        for (let i = 0; i < parcelsPayload.length; i++) {
            const p = parcelsPayload[i] || {};

            // weight is required and must be positive
            const weight = Number(p.weight_grams);
            if (!Number.isFinite(weight) || weight <= 0) {
                return {
                    success: false,
                    error: "Each parcel must include a valid positive weight_grams",
                };
            }

            const size = (p.size || item.size || "").toLowerCase();
            if (!size || !["small", "medium", "large"].includes(size)) {
                return { success: false, error: "Parcel size must be small, medium, or large" };
            }

            // Basic tracking code generation: use request_code + item suffix + parcel index
            // and add a short random segment to avoid collisions on retries.
            const baseCode = request.request_code || request._id.toString().slice(-8).toUpperCase();
            const itemSuffix = item._id.toString().slice(-4).toUpperCase();

            let tracking_code;
            let attempts = 0;
            // Try a few times to generate a unique tracking code; the
            // unique index on tracking_code acts as a safety net.
            while (attempts < 5) {
                const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
                tracking_code = `${baseCode}-${itemSuffix}-${i + 1}-${rand}`;
                const exists = await Parcel.exists({ tracking_code });
                if (!exists) break;
                attempts += 1;
            }

            if (!tracking_code) {
                return {
                    success: false,
                    error: "Failed to generate unique tracking code for parcel",
                };
            }

            // allow courier to override recipient details per parcel; fall back to item.recipient
            const recipientOverride = p.recipient || {};
            const hasCompleteRecipientOverride =
                recipientOverride.first_name &&
                recipientOverride.last_name &&
                recipientOverride.phone &&
                recipientOverride.address_text &&
                recipientOverride.sub_district;

            const recipient = hasCompleteRecipientOverride
                ? recipientOverride
                : item.recipient;

            // Find destination hub by matching recipient's sub_district
            const recipientSubDistrict = recipient.sub_district;
            const destHub = recipientSubDistrict
                ? await Hub.findOne({ sub_district: recipientSubDistrict, active: true }).lean()
                : null;

            if (!destHub) {
                return {
                    success: false,
                    error: `No active hub found for recipient sub-district: ${recipientSubDistrict || "N/A"}`,
                };
            }

            const originHubId = p.origin_hub_id && mongoose.Types.ObjectId.isValid(p.origin_hub_id)
                ? p.origin_hub_id
                : originHub._id;
            const destHubId = p.dest_hub_id && mongoose.Types.ObjectId.isValid(p.dest_hub_id)
                ? p.dest_hub_id
                : destHub._id;

            const parcel = await Parcel.create({
                tracking_code,
                sender: {
                    first_name: sender.first_name,
                    last_name: sender.last_name,
                    phone: sender.phone,
                },
                pickup_location: {
                    address_text: request.pickup_location.address_text,
                    sub_district: request.pickup_location.sub_district,
                },
                recipient: {
                    first_name: recipient.first_name,
                    last_name: recipient.last_name,
                    phone: recipient.phone,
                    address_text: recipient.address_text,
                    sub_district: recipient.sub_district,
                },
                origin_hub_id: originHubId,
                dest_hub_id: destHubId,
                weight_grams: weight,
                declared_value: Number(p.declared_value) || undefined,
            });

            createdParcels.push(parcel);
        }

        item.status = "parcel_created";
        // If fewer parcels were confirmed than originally requested,
        // shrink the quantity to match and treat the unconfirmed units
        // as effectively cancelled.
        if (parcelsPayload.length < item.quantity) {
            item.quantity = parcelsPayload.length;
        }

        // keep single parcel_id for backward compatibility with existing queries
        item.parcel_id = createdParcels[0]?._id || null;
        item.parcel_ids = createdParcels.map((pc) => pc._id);
        await item.save();

        // Optionally, mark request as in_progress once any item has parcels
        if (request.status === "assigned") {
            request.status = "in_progress";
            await request.save();
        }

        return {
            success: true,
            data: {
                item,
                parcels: createdParcels,
            },
        };
    } catch (error) {
        console.error("Error confirming pickup item parcels:", error);
        return {
            success: false,
            error: "Failed to confirm pickup item parcels",
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

/**
 * Mark a parcel as arrived at the origin hub
 * @param {ObjectId} courierId - Courier ID
 * @param {ObjectId} parcelId - Parcel ID
 * @returns {Object} - Result object
 */
export const markParcelArrivedAtHub = async (courierId, parcelId) => {
    try {
        // Verify the parcel exists
        const parcel = await Parcel.findById(parcelId).populate("origin_hub_id");
        if (!parcel) {
            return { success: false, error: "Parcel not found" };
        }

        // Check if courier has access to this parcel
        const hasAccess = await checkCourierAccessToParcel(parcelId, courierId);
        if (!hasAccess) {
            return {
                success: false,
                error: "Unauthorized: You don't have access to this parcel",
            };
        }

        // Check if parcel is in the correct status (should be picked_up)
        if (parcel.status !== "picked_up") {
            return {
                success: false,
                error: `Cannot mark as arrived at hub. Current status: ${parcel.status}`,
            };
        }

        // Update parcel status to at_origin_hub
        parcel.status = "at_origin_hub";
        await parcel.save();

        // Create a scan event
        const scanEvent = new ParcelScanEvent({
            parcel_id: parcelId,
            hub_id: parcel.origin_hub_id._id,
            courier_id: courierId,
            event_type: "arrived_hub",
            event_time: new Date(),
            notes: `Parcel arrived at origin hub: ${parcel.origin_hub_id.hub_name || parcel.origin_hub_id._id}`,
        });
        await scanEvent.save();

        return {
            success: true,
            data: {
                parcel,
                scanEvent,
                message: `Parcel marked as arrived at ${parcel.origin_hub_id.hub_name || "hub"}`,
            },
        };
    } catch (error) {
        console.error("Error marking parcel arrived at hub:", error);
        return {
            success: false,
            error: "Failed to mark parcel as arrived at hub",
            details: error.message,
        };
    }
};