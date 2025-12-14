"use client"

import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse, Calendar, PackageCheck, BarChart } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import React, { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/adminAuthContext'
import CourierForm from '@/components/CourierForm'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function CourierDetail() {
    const router = useRouter();
    const params = useSearchParams();
    const pathname = usePathname();
    const id = params.get('id');
    const { admin, loading } = useAdminAuth();

    const [courier, setCourier] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [metrics, setMetrics] = useState({
        deliveredCount: 0,
        assignedCount: 0,
        avgDeliveryMs: null,
        successRate: null
    });
    const [loadingData, setLoadingData] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Redirect if no admin
    useEffect(() => {
        if (!loading && !admin) {
            router.replace('/admin/login');
            return;
        }
    }, [admin, loading, router]);

    // Fetch courier details when ID changes
    useEffect(() => {
        if (!id) {
            router.replace('/admin/management/courier/list');
            return;
        }
        
        const fetchCourierDetails = async () => {
            try {
                setLoadingData(true);
                setError(null);
                const res = await fetch(`${API_BASE_URL}/api/admin/couriers/${id}`, { 
                    credentials: 'include',
                    cache: 'no-store'
                });
                
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Courier not found');
                    }
                    throw new Error(`Failed to fetch courier details: ${res.status}`);
                }
                
                const data = await res.json();
                setCourier(data.courier || null);
                setRoutes(data.routes || []);
                setRecentDeliveries(data.recentDeliveries || []);
                setMetrics({
                    deliveredCount: data.deliveredCount || 0,
                    assignedCount: data.assignedCount || 0,
                    avgDeliveryMs: data.avgDeliveryMs || null,
                    successRate: data.successRate || null
                });
            } catch (err) {
                setError(err.message);
                console.error('Error fetching courier details:', err);
            } finally {
                setLoadingData(false);
            }
        };
        
        fetchCourierDetails();
    }, [id, router]);

    // Handle activate/deactivate
    const toggleActive = async () => {
        if (!courier) return;
        
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/api/admin/couriers/${courier._id}/active`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ active: !courier.active })
            });
            
            if (!res.ok) {
                throw new Error(`Failed to update status: ${res.status}`);
            }
            
            const data = await res.json();
            setCourier(data.courier);
            setSuccess(`Courier ${!courier.active ? 'activated' : 'deactivated'} successfully!`);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
            console.error('Error updating courier status:', err);
        }
    }

    // Handle courier update
    const handleUpdateCourier = async (updatedData) => {
        try {
            setError(null);
            // This would call your backend update endpoint
            // For now, we'll just update the local state
            setCourier(prev => ({ ...prev, ...updatedData }));
            setSuccess('Courier updated successfully!');
            setEditing(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        }
    }

    // Format milliseconds to readable time
    const formatDuration = (ms) => {
        if (!ms && ms !== 0) return '-';
        const seconds = Math.floor(ms / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Loading state
    if (loadingData) {
        return (
            <div className="flex h-screen">
                <Sidebar>
                    <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                    <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                    <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                    <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                    <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                    <SidebarItem icon={<Truck />} text="Courier Management" active />
                    <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                    <SubSidebarItem text="Courier Details" active />
                    <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                    <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
                </Sidebar>
                
                <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                        <p className="text-gray-600">Loading courier details...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error && !courier) {
        return (
            <div className="flex h-screen">
                <Sidebar>
                    <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                    <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                    <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                    <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                    <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                    <SidebarItem icon={<Truck />} text="Courier Management" active />
                    <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                    <SubSidebarItem text="Courier Details" active />
                    <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                    <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
                </Sidebar>
                
                <main className="flex-1 p-6 overflow-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center text-red-800">
                            <span className="font-semibold">Error: </span>
                            <span className="ml-2">{error}</span>
                        </div>
                        <button 
                            onClick={() => router.push('/admin/management/courier/list')}
                            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        >
                            Back to Courier List
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" active />
                <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                <SubSidebarItem text="Courier Details" active />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>

            <main className="flex-1 p-6 overflow-auto bg-gray-50">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                            <span className="font-semibold">Success: </span>
                            <span className="ml-2">{success}</span>
                        </div>
                    </div>
                )}
                
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-800">
                            <span className="font-semibold">Error: </span>
                            <span className="ml-2">{error}</span>
                        </div>
                    </div>
                )}
                
                {/* Header Section */}
                <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {courier?.first_name} {courier?.last_name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center">
                                    <User size={16} className="mr-2" />
                                    <span>ID: {courier?.employee_id}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">📱</span>
                                    <span>{courier?.phone}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    courier?.active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {courier?.active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleActive}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    courier?.active 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                {courier?.active ? 'Deactivate' : 'Activate'} Courier
                            </button>
                            <button 
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                            >
                                Edit Courier
                            </button>
                            <button 
                                onClick={() => router.push('/admin/management/courier/list')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                </header>

                {/* Performance Metrics Section */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart size={20} className="mr-2" />
                        Performance Metrics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics.deliveredCount}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <PackageCheck size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Assigned</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics.assignedCount}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Package size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {metrics.successRate != null 
                                            ? `${Math.round(metrics.successRate * 100)}%` 
                                            : '-'}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <BarChart size={24} className="text-purple-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Delivery Time</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatDuration(metrics.avgDeliveryMs)}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <Calendar size={24} className="text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Two Column Layout for Recent Deliveries and Routes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Recent Deliveries Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <PackageCheck size={20} className="mr-2" />
                                Recent Deliveries
                            </h2>
                            <span className="text-sm text-gray-500">
                                Last 5 deliveries
                            </span>
                        </div>
                        
                        {recentDeliveries.length > 0 ? (
                            <div className="space-y-4">
                                {recentDeliveries.map((delivery, index) => (
                                    <div 
                                        key={delivery._id || index} 
                                        className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-900">
                                                {delivery.parcel?.tracking_code || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {delivery.signed_at ? formatDate(delivery.signed_at) : '-'}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Signed by: {delivery.recipient_name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            POD ID: {delivery._id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <PackageCheck size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No recent deliveries found</p>
                            </div>
                        )}
                    </section>

                    {/* Historical Routes Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Calendar size={20} className="mr-2" />
                                Historical Routes
                            </h2>
                            <span className="text-sm text-gray-500">
                                Last 10 routes
                            </span>
                        </div>
                        
                        {routes.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600 border-b">
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Parcels</th>
                                            <th className="pb-3 font-medium">Started</th>
                                            <th className="pb-3 font-medium">Ended</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routes.map((route) => (
                                            <tr 
                                                key={route._id} 
                                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                            >
                                                <td className="py-3 text-gray-900">
                                                    {route.route_date ? formatDate(route.route_date) : '-'}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        route.status === 'completed' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : route.status === 'in_progress' 
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {route.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-medium">
                                                    {route.parcel_count || 0}
                                                </td>
                                                <td className="py-3 text-gray-600 text-sm">
                                                    {route.started_at ? formatDateTime(route.started_at) : '-'}
                                                </td>
                                                <td className="py-3 text-gray-600 text-sm">
                                                    {route.ended_at ? formatDateTime(route.ended_at) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No route history found</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Edit Modal */}
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Courier</h2>
                                <button 
                                    onClick={() => setEditing(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>
                            
                            <CourierForm 
                                initialData={courier}
                                onCancel={() => setEditing(false)}
                                onSubmit={handleUpdateCourier}
                                submitText="Update Courier"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}