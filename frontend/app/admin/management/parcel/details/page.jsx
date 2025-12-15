"use client"

import { Boxes, BusFront, CircleSmall, Fullscreen, LayoutDashboard, Package, SquarePen, Truck, User, Warehouse, Users } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function parcelDetails() {
    const router = useRouter()
    const params = useSearchParams();
    const id = params.get('id');

    const [parcel, setParcel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [parcelId, setParcelId] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchParcel = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/admin/parcels/${id}`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch parcel');
                const data = await res.json();
                setParcel(data.parcel || null);
                setStatus(data.parcel?.status || '');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchParcel();
    }, [id]);

    const updateStatus = async (newStatus) => {
        if (!parcel) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/parcels/${parcel._id}`, { method: 'PUT', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: newStatus }) });
            if (!res.ok) throw new Error('Failed to update status');
            const data = await res.json();
            setParcel(data.parcel);
            setStatus(data.parcel.status);
        } catch (err) {
            setError(err.message);
        }
    }

    // Derived view models from fetched parcel
    const senderRecipient = parcel ? {
        sender_id: parcel.sender?.phone || '',
        sender_fname: parcel.sender?.first_name || '',
        sender_lname: parcel.sender?.last_name || '',
        recipient_id: parcel.recipient?.phone || '',
        recipient_fname: parcel.recipient?.first_name || '',
        recipient_lname: parcel.recipient?.last_name || ''
    } : null;

    const hubRoute = parcel ? {
        hub_origin_id: parcel.origin_hub_id || '',
        hub_origin_name: parcel.origin_hub_id || '',
        hub_dest_id: parcel.dest_hub_id || '',
        hub_dest_name: parcel.dest_hub_id || '',
        route_id: parcel.route_id || '-'
    } : null;

    const events = []; // ParcelScanEvent not fetched here; implement fetching if needed
    const proofStatus = null; // Proof of Delivery not fetched here; implement fetching if needed

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" active/>
                <SubSidebarItem text="Parcel List" onClick={() => router.push('/admin/management/parcel/list')} />
                <SubSidebarItem text="Parcel Detail" active />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Parcel Details
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Package className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Parcels</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-[16px] text-gray-600">Please input Parcel ID below</span>
                        <input className="w-full mt-2 px-2 py-1 border-2 rounded-lg" placeholder="e.g. P001" value={parcelId} onChange={(e) => setParcelId(e.target.value.trim())} />
                    </div>
                </div>

                {/* Sender & Recipient */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <User className="text-amber-600" />
                        Sender & Recipient
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Sender ID</th>
                                    <th className="px-2 py-1 text-center">Sender Name</th>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">Recipient Name</th>
                                </tr>
                            </thead>

                            <tbody>
                                {senderRecipient ? (
                                    <tr className="border-t">
                                        <td className="px-2 py-1 text-center">{senderRecipient.sender_id}</td>
                                        <td className="px-2 py-1 text-center">
                                            {senderRecipient.sender_fname} {senderRecipient.sender_lname}
                                        </td>
                                        <td className="px-2 py-1 text-center">{senderRecipient.recipient_id}</td>
                                        <td className="px-2 py-1 text-center">
                                            {senderRecipient.recipient_fname} {senderRecipient.recipient_lname}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-3 text-gray-400">
                                            No data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hub */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Warehouse className="text-amber-600" />
                        Hub & Route
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Origin Hub ID</th>
                                    <th className="px-2 py-1 text-center">Origin Hub Name</th>
                                    <th className="px-2 py-1 text-center">Destination Hub ID</th>
                                    <th className="px-2 py-1 text-center">Destination Hub Name</th>
                                    <th className="px-2 py-1 text-center">Route ID</th>
                                </tr>
                            </thead>

                            <tbody>
                                {hubRoute ? (
                                    <tr className="border-t">
                                        <td className="px-2 py-1 text-center">{hubRoute.hub_origin_id}</td>
                                        <td className="px-2 py-1 text-center">{hubRoute.hub_origin_name}</td>
                                        <td className="px-2 py-1 text-center">{hubRoute.hub_dest_id}</td>
                                        <td className="px-2 py-1 text-center">{hubRoute.hub_dest_name}</td>
                                        <td className="px-2 py-1 text-center">{hubRoute.route_id}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-3 text-gray-400">
                                            No data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Events */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Boxes className="text-amber-600" />
                        Events
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Event Time</th>
                                    <th className="px-2 py-1 text-center">Hub ID</th>
                                    <th className="px-2 py-1 text-center">Courier ID</th>
                                    <th className="px-2 py-1 text-center">Event Type</th>
                                </tr>
                            </thead>

                            <tbody>
                                {events.length > 0 ? (
                                    events.map((e, i) => (
                                        <tr className="border-t">
                                            <td className="px-2 py-1 text-center">{e.event_time}</td>
                                            <td className="px-2 py-1 text-center">{e.hub_id ?? "-"}</td>
                                            <td className="px-2 py-1 text-center">{e.courier_id ?? "-"}</td>
                                            <td className="px-2 py-1 text-center">{e.event_type}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-3 text-gray-400">
                                            No data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Proof & Status */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Fullscreen className="text-amber-600" />
                        Proof & Status
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">Photo Proof</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {proofStatus ? (
                                    <tr className="border-t">
                                        <td className="px-2 py-1 text-center">{proofStatus.recipient_id}</td>
                                        <td className="px-2 py-1 text-center">
                                            <a href={proofStatus.photo_url} className="text-blue-600 underline">
                                                View
                                            </a>
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <div>
                                                <label className="block">
                                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg">
                                                        <option value="" disabled>Select status</option>
                                                        <option value="picked up">Picked Up</option>
                                                        <option value="at origin hub">At Origin Hub</option>
                                                        <option value="in linehaul">In Linehaul</option>
                                                        <option value="at destination hub">At Destination Hub</option>
                                                        <option value="out for delivery">Out For Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="failed delivery">Failed Delivery</option>
                                                        <option value="returned to sender">Returned To Sender</option>
                                                        <option value="canceled">Canceled</option>
                                                    </select>
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-3 text-gray-400">
                                            No proof
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
