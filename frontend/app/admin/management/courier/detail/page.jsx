"use client"

import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/adminAuthContext'
import CourierForm from '@/components/CourierForm'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function CourierDetail() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');
    const { admin, loading } = useAdminAuth();

    const [courier, setCourier] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!loading && !admin) {
            router.replace('/admin/login');
            return;
        }
    }, [admin, loading, router]);

    useEffect(() => {
        if (!id) return;
        const fetchCourierDetails = async () => {
            try {
                setLoadingData(true);
                const res = await fetch(`${API_BASE_URL}/api/admin/couriers/${id}`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch courier details');
                const data = await res.json();
                setCourier(data.courier || null);
                setRoutes(data.routes || []);
                setRecentDeliveries(data.recentDeliveries || []);
                setMetrics({ deliveredCount: data.deliveredCount, assignedCount: data.assignedCount, avgDeliveryMs: data.avgDeliveryMs, successRate: data.successRate });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingData(false);
            }
        };
        fetchCourierDetails();
    }, [id]);

    const toggleActive = async () => {
        if (!courier) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/couriers/${courier._id}/active`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !courier.active })
            });
            if (!res.ok) throw new Error('Failed to update');
            const data = await res.json();
            setCourier(data.courier);
        } catch (err) {
            setError(err.message);
        }
    }

    const fmtMs = (ms) => {
        if (!ms && ms !== 0) return '-';
        const sec = Math.floor(ms / 1000);
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`;
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                <SubSidebarItem text="Create/Update Courier" onClick={() => router.push('/admin/management/courier/create')} />
                <SubSidebarItem text="Courier Details" active />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>

            <main className="flex-1 p-6 overflow-auto">
                {error && <div className="text-red-600">{error}</div>}
                    <div>
                        <header className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold">{courier?.first_name} {courier.last_name}</h1>
                                {/* <div className="text-sm text-gray-600">Vehicle: {courier.vehicle_type || '-'}</div> */}
                            </div>
                            <div className="flex items-center gap-4">
                                    <div className="text-sm">Status: {courier.active ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}</div>
                                    <button onClick={toggleActive} className="px-3 py-1 bg-amber-600 text-white rounded">{courier.active ? 'Deactivate' : 'Activate'}</button>
                                    <button onClick={() => setEditing(true)} className="px-3 py-1 border rounded">Edit</button>
                                </div>
                        </header>

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="col-span-1 bg-white rounded p-4 shadow-sm">
                                <h2 className="font-semibold mb-2">Performance</h2>
                                <div>Total Delivered: <strong>{metrics?.deliveredCount ?? 0}</strong></div>
                                <div>Assigned: <strong>{metrics?.assignedCount ?? 0}</strong></div>
                                <div>Success Rate: <strong>{metrics?.successRate != null ? (Math.round(metrics.successRate * 100) + '%') : '-'}</strong></div>
                                <div>Avg Delivery Time: <strong>{fmtMs(metrics?.avgDeliveryMs)}</strong></div>
                            </div>
                            <div className="col-span-2 bg-white rounded p-4 shadow-sm">
                                <h2 className="font-semibold mb-2">Recent Deliveries</h2>
                                {recentDeliveries.length ? (
                                    <ul className="divide-y">
                                        {recentDeliveries.map(d => (
                                            <li key={d._id} className="py-2 flex justify-between">
                                                <div>
                                                    <div className="font-medium">{d.parcel?.tracking_code || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">Signed: {d.signed_at ? new Date(d.signed_at).toLocaleString() : '-'}</div>
                                                </div>
                                                <div className="text-sm text-gray-600">POD ID: {d._id}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div>No recent deliveries</div>
                                )}
                                {/* Edit modal */}
                                {editing && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                        <div className="bg-white rounded p-6 w-full max-w-2xl">
                                            <div className="flex items-center justify-between mb-3">
                                                <h2 className="text-lg font-semibold">Edit Courier</h2>
                                                <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded">Close</button>
                                            </div>
                                            <CourierForm initialData={courier} onCancel={() => setEditing(false)} onSubmit={(payload) => {
                                                console.log('Update payload', payload);
                                                // user will implement backend save
                                                setEditing(false);
                                            }} submitText="Update" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded p-4 shadow-sm">
                            <h2 className="font-semibold mb-2">Historical Routes</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="py-2">Date</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Parcel Count</th>
                                            <th className="py-2">Started</th>
                                            <th className="py-2">Ended</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routes.map(r => (
                                            <tr key={r._id} className="border-t">
                                                <td className="py-2">{r.route_date ? new Date(r.route_date).toLocaleDateString() : '-'}</td>
                                                <td className="py-2">{r.status}</td>
                                                <td className="py-2">{r.parcel_count || 0}</td>
                                                <td className="py-2">{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
                                                <td className="py-2">{r.ended_at ? new Date(r.ended_at).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
            </main>
        </div>
    )
}