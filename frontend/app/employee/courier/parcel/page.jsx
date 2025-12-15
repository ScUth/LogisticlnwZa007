"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { Play, CheckSquare, MapPin, Package, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import react from "react"
import React, { useEffect, useState } from "react"
import { useEmployeeAuth } from "@/context/employeeAuthContext"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826";

export default function Parcel() {
    const router = useRouter()
    const { employee } = useEmployeeAuth();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchParcels = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/employee/parcels`, { credentials: 'include' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setParcels(data.data.groupedParcels.forDelivery.concat(data.data.groupedParcels.inTransit, data.data.groupedParcels.forPickup));
        } catch (err) {
            console.error(err);
            setError('Failed to load parcels');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // only fetch if employee logged in
        if (employee) fetchParcels();
    }, [employee]);

    const markDelivered = async (parcel) => {
        const recipient = window.prompt('Recipient name (optional)', parcel.recipient?.first_name ? `${parcel.recipient.first_name} ${parcel.recipient.last_name}` : '');
        if (recipient === null) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/employee/parcels/${parcel._id}/deliver`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient_name: recipient }),
            });
            if (!res.ok) throw new Error(await res.text());
            await fetchParcels();
        } catch (err) {
            console.error(err);
            alert('Failed to mark delivered');
        }
    }

    const markFailed = async (parcel) => {
        const reason = window.prompt('Failure reason', 'Recipient not available');
        if (reason === null) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/employee/parcels/${parcel._id}/fail`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error(await res.text());
            await fetchParcels();
        } catch (err) {
            console.error(err);
            alert('Failed to mark failed');
        }
    }
    
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<Play />} text="Dashboard" onClick={() => router.push('/employee/courier/dashboard')}/>
                <SidebarItem icon={<Package />} text="Parcel" active/>
                <SidebarItem icon={<Package />} text="Parcels" onClick={() => router.push('/employee/courier/parcels')}/>
                <SidebarItem icon={<MapPin />} text="Route" onClick={() => router.push('/employee/courier/route')}/>
                <SidebarItem icon={<Truck />} text="Pickup" onClick={() => router.push('/employee/courier/pickup')}/>
            </Sidebar>
            <main className="flex-1 p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-xl font-semibold mb-4">My Parcels</h1>
                    {!employee && <div className="text-sm text-gray-500">Please login to see your assigned parcels.</div>}
                    {loading && <div>Loading parcels...</div>}
                    {error && <div className="text-red-600">{error}</div>}
                    {!loading && !error && parcels.length === 0 && <div>No parcels assigned</div>}
                    <ul className="space-y-3 mt-4">
                        {parcels.map((p) => (
                            <li key={p._id} className="bg-white p-4 rounded shadow flex items-start justify-between">
                                <div>
                                    <div className="font-semibold">{p.tracking_code}</div>
                                    <div className="text-sm text-gray-600">{p.recipient?.first_name} {p.recipient?.last_name} • {p.recipient?.phone}</div>
                                    <div className="text-sm text-gray-600">{p.recipient?.address_text}</div>
                                    <div className="text-sm mt-1">Status: <span className="font-medium">{p.status}</span></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button disabled={p.status === 'delivered' || p.status === 'failed_delivery'} onClick={() => markDelivered(p)} className="bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded">Mark Delivered</button>
                                    <button disabled={p.status === 'delivered' || p.status === 'failed_delivery'} onClick={() => markFailed(p)} className="bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded">Mark Failed</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    )
}