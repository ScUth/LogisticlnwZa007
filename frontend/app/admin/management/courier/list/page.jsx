"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import { useAdminAuth } from '@/context/adminAuthContext';
import Sidebar, { SidebarItem, SubSidebarItem } from '@/components/AdminSidebar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function CourierList() {
    const { admin, loading } = useAdminAuth();
    const router = useRouter();
    const [couriers, setCouriers] = useState([]);
    const [error, setError] = useState(null);

    // ALSO CREATE OR UPDATE THE COURIER (IMPLEMENT LATER)

    useEffect(() => {
        console.log("Admin:", admin, "Loading:", loading);
        if (!loading && !admin) {
            router.replace('/admin/login');
            return;
        }

        const fetchCouriers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/couriers`, { credentials: 'include' });
                if (!res.ok) {
                    throw new Error('Failed to fetch couriers');
                }
                const data = await res.json();
                setCouriers(data.couriers || []);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCouriers();
    }, [admin, loading]);

    return (
        <div>
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management"/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record"/>
                <SidebarItem icon={<Package />} text="Parcel Management"/>
                <SidebarItem icon={<BusFront />} text="Route Management"/>
                <SidebarItem icon={<Truck />} text="Courier Management" active/>
                <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                <SubSidebarItem text="Create Courier" onClick={() => router.push('/admin/management/courier/create')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management"/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management"/>
            </Sidebar>
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Courier Management</h1>
                {error && <div className="text-red-500">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Employee ID</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">Vehicle Type</th>
                                <th className="px-4 py-2 text-left">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {couriers.map((c) => (
                                <tr key={c._id} className="border-t">
                                    <td className="px-4 py-2">{c.first_name} {c.last_name}</td>
                                    <td className="px-4 py-2">{c.employee_id}</td>
                                    <td className="px-4 py-2">{c.phone}</td>
                                    <td className="px-4 py-2">{c.vehicle_type || '-'}</td>
                                    <td className="px-4 py-2">{(c.active === false) ? <span className="text-red-600">Inactive</span> : <span className="text-green-600">Active</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}