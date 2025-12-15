"use client";

import Sidebar, { SidebarItem } from "@/components/driversidebar";
import { Play, MapPin, Package, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(
            `Server did not return JSON for ${url}. Response starts with: ${text.slice(0, 80)}`
        );
    }

    const data = await res.json();
    return { res, data };
}

export default function PickupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pickupItems, setPickupItems] = useState([]);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [acceptingId, setAcceptingId] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [pickedUpParcels, setPickedUpParcels] = useState([]);
    const [markingHubArrival, setMarkingHubArrival] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (typeof window !== "undefined") {
                    console.debug("[PickupPage] API_BASE_URL", API_BASE_URL);
                }
                // 1) Tasks already assigned to this courier
                const { res: parcelsRes, data: parcelsData } = await fetchJson(
                    `${API_BASE_URL}/api/courier/parcels`,
                    { credentials: "include" }
                );

                if (typeof window !== "undefined") {
                    console.debug("[PickupPage] parcels response", parcelsRes.status, parcelsData);
                }

                if (!parcelsRes.ok || !parcelsData.success) {
                    throw new Error(parcelsData.error || parcelsData.message || "Failed to load assigned parcels");
                }

                setPickupItems(parcelsData.data?.groupedParcels?.forPickup || []);
                setVehicle(parcelsData.data?.vehicle || null);
                
                // Get parcels that have been picked up (status = "picked_up")
                const inTransitParcels = parcelsData.data?.groupedParcels?.inTransit || [];
                const pickedUpOnly = inTransitParcels.filter(p => p.status === "picked_up");
                setPickedUpParcels(pickedUpOnly);

                // 2) Vehicles available to this courier
                const { res: vehiclesRes, data: vehiclesData } = await fetchJson(
                    `${API_BASE_URL}/api/courier/vehicles`,
                    { credentials: "include" }
                );

                if (!vehiclesRes.ok || vehiclesData.success === false) {
                    throw new Error(vehiclesData.error || vehiclesData.message || "Failed to load vehicles");
                }
                const vehiclesArray = Array.isArray(vehiclesData.data)
                    ? vehiclesData.data
                    : Array.isArray(vehiclesData.data?.vehicles)
                        ? vehiclesData.data.vehicles
                        : [];

                if (typeof window !== "undefined") {
                    console.debug("[PickupPage] vehicles response", vehiclesRes.status, vehiclesData);
                    console.debug("[PickupPage] vehicles parsed", vehiclesArray);
                }

                setVehicles(vehiclesArray);

                // 3) Available (unassigned) pickup requests
                const { res: availableRes, data: availableData } = await fetchJson(
                    `${API_BASE_URL}/api/courier/pickup-requests/available`,
                    { credentials: "include" }
                );

                if (!availableRes.ok || availableData.success === false) {
                    throw new Error(availableData.error || availableData.message || "Failed to load available requests");
                }

                setAvailableRequests(availableData.data?.requests || []);
            } catch (err) {
                if (typeof window !== "undefined") {
                    console.error("[PickupPage] fetchAllData error", err);
                }
                setError(err.message || "Error loading pickup data");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleAcceptRequest = async (requestId, selectedVehicleId) => {
        if (!selectedVehicleId) return;

        setAcceptingId(requestId);
        setError(null);
        try {
            if (typeof window !== "undefined") {
                console.debug("[PickupPage] accepting pickup", { requestId, selectedVehicleId });
            }
            const { res, data } = await fetchJson(
                `${API_BASE_URL}/api/courier/pickup-requests/${requestId}/accept`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ vehicle_id: selectedVehicleId }),
                }
            );

            if (!res.ok || data.success === false) {
                throw new Error(data.error || data.message || "Failed to accept request");
            }

            // Refresh data so the accepted request disappears from available and appears in assigned
            const { res: refreshRes, data: refreshData } = await fetchJson(
                `${API_BASE_URL}/api/courier/parcels`,
                { credentials: "include" }
            );
            if (refreshRes.ok && refreshData.success) {
                setPickupItems(refreshData.data?.groupedParcels?.forPickup || []);
                setVehicle(refreshData.data?.vehicle || null);
                const inTransitParcels = refreshData.data?.groupedParcels?.inTransit || [];
                const pickedUpOnly = inTransitParcels.filter(p => p.status === "picked_up");
                setPickedUpParcels(pickedUpOnly);
            }

            const { res: availableRes, data: availableData } = await fetchJson(
                `${API_BASE_URL}/api/courier/pickup-requests/available`,
                { credentials: "include" }
            );
            if (availableRes.ok && availableData.success) {
                setAvailableRequests(availableData.data?.requests || []);
            }
        } catch (err) {
            if (typeof window !== "undefined") {
                console.error("[PickupPage] accept pickup error", err);
            }
            setError(err.message || "Error accepting pickup request");
        } finally {
            setAcceptingId(null);
        }
    };

    const handleMarkArrivedAtHub = async (parcelId) => {
        setMarkingHubArrival(parcelId);
        setError(null);
        try {
            if (typeof window !== "undefined") {
                console.debug("[PickupPage] marking parcel arrived at hub", parcelId);
            }
            const { res, data } = await fetchJson(
                `${API_BASE_URL}/api/courier/parcels/${parcelId}/arrived-at-hub`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!res.ok || data.success === false) {
                throw new Error(data.error || data.message || "Failed to mark parcel as arrived");
            }

            // Refresh data
            const { res: refreshRes, data: refreshData } = await fetchJson(
                `${API_BASE_URL}/api/courier/parcels`,
                { credentials: "include" }
            );
            if (refreshRes.ok && refreshData.success) {
                setPickupItems(refreshData.data?.groupedParcels?.forPickup || []);
                const inTransitParcels = refreshData.data?.groupedParcels?.inTransit || [];
                const pickedUpOnly = inTransitParcels.filter(p => p.status === "picked_up");
                setPickedUpParcels(pickedUpOnly);
            }
        } catch (err) {
            if (typeof window !== "undefined") {
                console.error("[PickupPage] mark arrived at hub error", err);
            }
            setError(err.message || "Error marking parcel as arrived at hub");
        } finally {
            setMarkingHubArrival(null);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem
                    icon={<Play />}
                    text="Dashboard"
                    onClick={() => router.push("/employee/courier/dashboard")}
                />
                <SidebarItem
                    icon={<Package />}
                    text="Parcel"
                    onClick={() => router.push("/employee/courier/parcel")}
                />
                <SidebarItem
                    icon={<Package />}
                    text="Parcels"
                    onClick={() => router.push("/employee/courier/parcels")}
                />
                <SidebarItem
                    icon={<MapPin />}
                    text="Route"
                    onClick={() => router.push("/employee/courier/route")}
                />
                <SidebarItem icon={<MapPin />} text="Pickup" active />
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Pickup Requests</h1>
                        <p className="mt-1 text-gray-600">
                            Requests waiting for pickup assigned to you.
                        </p>
                    </div>
                    {vehicle && (
                        <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center gap-3">
                            <div className="p-2 rounded-md bg-amber-50">
                                <Truck className="text-amber-600" />
                            </div>
                            <div className="text-sm text-gray-700">
                                <div className="font-semibold">Your Vehicle</div>
                                <div>
                                    {vehicle.vehicle_type} • {vehicle.plate_no}
                                </div>
                                {vehicle.capacity_kg && (
                                    <div className="text-xs text-gray-500">
                                        Capacity: {vehicle.capacity_kg} kg
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Available pickup requests to accept */}
                <section className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-2">Available Pickup Requests</h2>
                    <p className="text-sm text-gray-600 mb-3">
                        These requests are pending and not yet assigned. Choose a vehicle and accept to take the job.
                    </p>
                    {loading ? (
                        <div className="text-gray-400">Loading pickup data...</div>
                    ) : error ? (
                        <div className="text-red-500 text-sm mb-2">{error}</div>
                    ) : availableRequests.length === 0 ? (
                        <div className="text-gray-500 text-sm">
                            No unassigned pickup requests right now.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableRequests.map(({ request, items }) => {
                                const firstItem = items[0];
                                const totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
                                const sizes = Array.from(new Set(items.map((it) => it.size))).join(", ");

                                // choose default vehicle: existing assigned vehicle or first available
                                const defaultVehicleId =
                                    vehicle?._id || (vehicles[0] && vehicles[0]._id);

                                return (
                                    <div
                                        key={request._id}
                                        className="border rounded-md p-3 flex flex-col gap-3"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <div className="text-sm text-gray-500">Request Code</div>
                                                <div className="font-semibold text-gray-800">
                                                    {request.request_code || request._id}
                                                </div>
                                                {request?.pickup_location && (
                                                    <div className="mt-1 text-sm text-gray-700">
                                                        Pickup location
                                                    </div>
                                                )}
                                                {request?.pickup_location?.address_text && (
                                                    <div className="text-xs text-gray-600 truncate max-w-[320px]">
                                                        {request.pickup_location.address_text}
                                                    </div>
                                                )}
                                                {request?.pickup_location?.sub_district && (
                                                    <div className="text-xs text-gray-500">
                                                        {request.pickup_location.sub_district}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                                                <div className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                                    Sizes: <span className="font-semibold">{sizes}</span>
                                                </div>
                                                <div className="px-2 py-1 rounded-full bg-gray-100">
                                                    Items: <span className="font-semibold">{items.length}</span>
                                                </div>
                                                <div className="px-2 py-1 rounded-full bg-gray-100">
                                                    Total qty: <span className="font-semibold">{totalQty}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Dialog>
                                                    <DialogTrigger className="text-xs font-medium text-emerald-700 underline underline-offset-2">
                                                        View items
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Pickup request items</DialogTitle>
                                                            <DialogDescription>
                                                                {items.length} item(s) in request {request.request_code || request._id}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-2 max-h-[60vh] overflow-y-auto text-sm">
                                                            {items.map((it) => (
                                                                <div
                                                                    key={it._id}
                                                                    className="border rounded-md p-2 flex flex-col gap-1"
                                                                >
                                                                    <div className="font-medium text-gray-800">
                                                                        {it.recipient.first_name} {" "}
                                                                        {it.recipient.last_name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 truncate">
                                                                        {it.recipient.address_text}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {it.recipient.sub_district}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-700">
                                                                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                                                            Size: <span className="font-semibold">{it.size}</span>
                                                                        </span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-gray-100">
                                                                            Qty: <span className="font-semibold">{it.quantity}</span>
                                                                        </span>
                                                                        {it.estimated_weight != null && (
                                                                            <span className="px-2 py-0.5 rounded-full bg-gray-100">
                                                                                Est. weight: {it.estimated_weight} g
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-gray-700">Vehicle:</label>
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm"
                                                        defaultValue={defaultVehicleId || ""}
                                                        onChange={(e) => {
                                                            const selected = e.target.value;
                                                            e.target.dataset.selectedVehicleId = selected;
                                                        }}
                                                        data-selected-vehicle-id={defaultVehicleId || ""}
                                                    >
                                                        <option value="" disabled>
                                                            Select vehicle
                                                        </option>
                                                        {vehicles.map((v) => (
                                                            <option key={v._id} value={v._id}>
                                                                {v.vehicle_type} • {v.plate_no} ({v.capacity_kg} kg)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                disabled={acceptingId === request._id || vehicles.length === 0}
                                                onClick={(e) => {
                                                    const selectEl = e.currentTarget
                                                        .parentElement
                                                        .querySelector("select[data-selected-vehicle-id]");
                                                    const selectedVehicleId =
                                                        selectEl?.dataset.selectedVehicleId || selectEl?.value;
                                                    handleAcceptRequest(request._id, selectedVehicleId);
                                                }}
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {acceptingId === request._id ? "Accepting..." : "Accept Request"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Already assigned pickup tasks for this courier */}
                <section className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold mb-2">Your Pickup Tasks</h2>
                    {loading ? (
                        <div className="text-gray-400">Loading pickup tasks...</div>
                    ) : error ? (
                        <div className="text-red-500 text-sm">{error}</div>
                    ) : pickupItems.length === 0 ? (
                        <div className="text-gray-500 text-sm">
                            No pickup tasks assigned to you right now.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pickupItems.map((item) => {
                                const pickupItemId = item.pickup_request_item || item._id;

                                return (
                                    <div
                                        key={item._id}
                                        className="border rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                    >
                                        <div>
                                            {item.recipient && (
                                                <div className="font-medium text-gray-800">
                                                    {item.recipient.first_name} {" "}
                                                    {item.recipient.last_name}
                                                </div>
                                            )}
                                            {item.recipient?.address_text && (
                                                <div className="text-sm text-gray-600 truncate max-w-[320px]">
                                                    {item.recipient.address_text}
                                                </div>
                                            )}
                                            {item.recipient?.sub_district && (
                                                <div className="text-xs text-gray-500">
                                                    {item.recipient.sub_district}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                                            <div className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                                Size: <span className="font-semibold">{item.size}</span>
                                            </div>
                                            {item.quantity != null && (
                                                <div className="px-2 py-1 rounded-full bg-gray-100">
                                                    Qty: <span className="font-semibold">{item.quantity}</span>
                                                </div>
                                            )}
                                            {item.estimated_weight != null && (
                                                <div className="px-2 py-1 rounded-full bg-gray-100">
                                                    Est. weight: {item.estimated_weight} g
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(`/employee/courier/parcel/${pickupItemId}`)
                                                }
                                                className="ml-auto inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                Create parcels
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Picked up parcels ready to be delivered to hub */}
                {pickedUpParcels.length > 0 && (
                    <section className="bg-white rounded-lg shadow p-4 mt-6">
                        <h2 className="text-lg font-semibold mb-2">Parcels to Deliver to Hub</h2>
                        <p className="text-sm text-gray-600 mb-3">
                            These parcels have been picked up. Mark them as arrived when you reach the origin hub.
                        </p>
                        <div className="space-y-3">
                            {pickedUpParcels.map((parcel) => (
                                <div
                                    key={parcel._id}
                                    className="border rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                >
                                    <div className="flex-1">
                                        <div className="font-mono text-sm text-emerald-700 font-semibold">
                                            {parcel.tracking_code}
                                        </div>
                                        {parcel.recipient && (
                                            <div className="font-medium text-gray-800 mt-1">
                                                To: {parcel.recipient.first_name} {parcel.recipient.last_name}
                                            </div>
                                        )}
                                        {parcel.recipient?.address_text && (
                                            <div className="text-sm text-gray-600 truncate max-w-[320px]">
                                                {parcel.recipient.address_text}
                                            </div>
                                        )}
                                        {parcel.recipient?.sub_district && (
                                            <div className="text-xs text-gray-500">
                                                {parcel.recipient.sub_district}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                                        {parcel.weight_grams && (
                                            <div className="px-2 py-1 rounded-full bg-gray-100">
                                                Weight: <span className="font-semibold">{parcel.weight_grams}g</span>
                                            </div>
                                        )}
                                        <div className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                            Status: <span className="font-semibold">{parcel.status}</span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={markingHubArrival === parcel._id}
                                            onClick={() => handleMarkArrivedAtHub(parcel._id)}
                                            className="ml-auto inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {markingHubArrival === parcel._id
                                                ? "Marking..."
                                                : "Mark Arrived at Hub"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}