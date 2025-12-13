"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import { useAdminAuth } from '@/context/adminAuthContext';
import Sidebar, { SidebarItem, SubSidebarItem } from '@/components/AdminSidebar';
import CourierForm from '@/components/CourierForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function CourierList() {
    // const { admin, loading } = useAdminAuth();
    const router = useRouter();
    const [couriers, setCouriers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // ALSO CREATE OR UPDATE THE COURIER (IMPLEMENT LATER)

    useEffect(() => {
        const loadCouriers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                    method: "GET",
                    credentials: "include",
                });
                // console.log(response);
                if (!response.ok) {
                    console.error("Failed to fetch couriers, status:", response);
                    throw new Error(`Error:  ${response.status}`);
                }

                const data = await response.json();
                // console.log("", data);

                setCouriers(data.couriers || []); 
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch couriers:", err);
            } finally {
                setLoading(false);
            }
        }

        loadCouriers();
    }, [])

    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SubSidebarItem text="Courier List" active />
                <SubSidebarItem text="Create/Update Courier" onClick={() => router.push('/admin/management/courier/create')} />
                <SubSidebarItem text="Courier Detail" onClick={() => router.push('/admin/management/courier/detail')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>
            <div className="flex-1 overflow-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Courier Management</h1>
                    <div>
                        <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-amber-600 text-white rounded">Create Courier</button>
                    </div>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Employee ID</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                {/* <th className="px-4 py-2 text-left">Vehicle Type</th> */}
                                <th className="px-4 py-2 text-left">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {couriers.map((c) => (
                                <tr key={c._id} className="border-t">
                                    <td className="px-4 py-2">{c.first_name} {c.last_name}</td>
                                    <td className="px-4 py-2">{c.employee_id}</td>
                                    <td className="px-4 py-2">{c.phone}</td>
                                    {/* <td className="px-4 py-2">{c.vehicle_type || '-'}</td> */} {/* Remove this */}
                                    <td className="px-4 py-2">
                                        {(c.active === false) ?
                                            <span className="text-red-600">Inactive</span> :
                                            <span className="text-green-600">Active</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create modal (UI only) */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded p-6 w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">Create Courier</h2>
                            <button onClick={() => setShowCreate(false)} className="px-2 py-1 border rounded">Close</button>
                        </div>
                        <div>
                            <CourierForm onSubmit={(payload) => {
                                console.log('Create courier payload', payload);
                                // The caller will implement actual backend create, so we'll just close modal
                                setShowCreate(false);
                            }} onCancel={() => setShowCreate(false)} submitText="Create" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}