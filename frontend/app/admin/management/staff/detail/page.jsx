"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Users, Building, Calendar, Package, BarChart, 
    Phone, User, MapPin, Clock, Activity, AlertCircle 
} from "lucide-react";
import { useAdminAuth } from '@/context/adminAuthContext';
import Sidebar, { SidebarItem, SubSidebarItem } from '@/components/AdminSidebar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function StaffDetail() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');
    const { admin, loading: authLoading } = useAdminAuth();

    const [staff, setStaff] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [metrics, setMetrics] = useState({
        parcelsAtHub: 0,
        recentDeliveries: 0,
        activitiesCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editing, setEditing] = useState(false);
    const [hubs, setHubs] = useState([]);

    // Form state for editing
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        employee_id: '',
        role: '',
        current_hub: '',
        active: true
    });

    // Redirect if no admin
    useEffect(() => {
        if (!authLoading && !admin) {
            router.replace('/admin/login');
        }
    }, [admin, authLoading, router]);

    // Fetch staff details
    useEffect(() => {
        if (!id) {
            router.replace('/admin/management/staff/list');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch hubs for dropdown
                const hubsRes = await fetch(`${API_BASE_URL}/api/admin/hubs`, {
                    credentials: 'include'
                });
                if (hubsRes.ok) {
                    const hubsData = await hubsRes.json();
                    setHubs(hubsData.hubs || []);
                }

                // Fetch staff details
                const staffRes = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
                    credentials: 'include'
                });

                if (!staffRes.ok) {
                    if (staffRes.status === 404) {
                        throw new Error('Staff member not found');
                    }
                    throw new Error(`Failed to load staff details: ${staffRes.status}`);
                }

                const data = await staffRes.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to load staff details');
                }

                setStaff(data.staff);
                setRecentActivities(data.recentActivities || []);
                setMetrics(data.metrics || {
                    parcelsAtHub: 0,
                    recentDeliveries: 0,
                    activitiesCount: 0
                });

                // Initialize form data
                setFormData({
                    first_name: data.staff.first_name || '',
                    last_name: data.staff.last_name || '',
                    phone: data.staff.phone || '',
                    employee_id: data.staff.employee_id || '',
                    role: data.staff.role || '',
                    current_hub: data.staff.current_hub?._id || '',
                    active: data.staff.active || true
                });

            } catch (err) {
                setError(err.message);
                console.error('Error fetching staff details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // Handle activate/deactivate
    const handleToggleActive = async () => {
        if (!staff) return;

        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${staff._id}/active`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ active: !staff.active })
            });

            if (!res.ok) throw new Error('Failed to update status');

            const data = await res.json();
            setStaff(data.staff);
            setSuccess(`Staff ${!staff.active ? 'activated' : 'deactivated'} successfully!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${staff._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update staff');
            }

            setStaff(data.staff);
            setSuccess('Staff updated successfully!');
            setEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar>
                    <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                    <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                    <SidebarItem icon={<Users />} text="Staff Management" active />
                    <SubSidebarItem text="Staff List" onClick={() => router.push('/admin/management/staff/list')} />
                    <SubSidebarItem text="Staff Detail" active />
                    <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                    <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                    <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                    <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                    <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                    <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
                </Sidebar>
                
                <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                        <p className="text-gray-600">Loading staff details...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error && !staff) {
        return (
            <div className="flex h-screen">
                <Sidebar>
                    <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                    <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                    <SidebarItem icon={<Users />} text="Staff Management" active />
                    <SubSidebarItem text="Staff List" onClick={() => router.push('/admin/management/staff/list')} />
                    <SubSidebarItem text="Staff Detail" active />
                    <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                    <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                    <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                    <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                    <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                    <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
                </Sidebar>
                
                <main className="flex-1 p-6 overflow-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center text-red-800 mb-4">
                            <AlertCircle className="mr-2" size={20} />
                            <span className="font-semibold">Error: </span>
                            <span className="ml-2">{error}</span>
                        </div>
                        <button 
                            onClick={() => router.push('/admin/management/staff/list')}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        >
                            Back to Staff List
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
                <SidebarItem icon={<Users />} text="Staff Management" active />
                <SubSidebarItem text="Staff List" onClick={() => router.push('/admin/management/staff/list')} />
                <SubSidebarItem text="Staff Detail" active />
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>

            <main className="flex-1 p-6 overflow-auto bg-gray-50">
                {/* Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-800">
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <User size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {staff?.first_name} {staff?.last_name}
                                    </h1>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-600">
                                            <Phone size={16} className="mr-2" />
                                            <span>{staff?.phone}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">ID:</span>
                                            <span className="font-mono">{staff?.employee_id}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                staff?.role === 'manager' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {staff?.role?.charAt(0).toUpperCase() + staff?.role?.slice(1)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                staff?.active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {staff?.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <button 
                                onClick={handleToggleActive}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    staff?.active 
                                        ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                        : 'bg-green-50 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                {staff?.active ? 'Deactivate Staff' : 'Activate Staff'}
                            </button>
                            <button 
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                            >
                                Edit Staff
                            </button>
                            <button 
                                onClick={() => router.push('/admin/management/staff/list')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>

                    {/* Hub Information */}
                    {staff?.current_hub && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Building size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Assigned Hub
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-700">
                                            <span className="font-medium mr-2">Name:</span>
                                            <span>{staff.current_hub.name || staff.current_hub.hub_name}</span>
                                        </div>
                                        {staff.current_hub.code && (
                                            <div className="flex items-center text-gray-700">
                                                <span className="font-medium mr-2">Code:</span>
                                                <span className="font-mono">{staff.current_hub.code}</span>
                                            </div>
                                        )}
                                        {staff.current_hub.address_text && (
                                            <div className="flex items-start text-gray-700">
                                                <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                                                <span>{staff.current_hub.address_text}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Performance Metrics Section */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart size={20} className="mr-2" />
                        Hub Performance Metrics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Parcels at Hub</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics.parcelsAtHub}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Package size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Recent Processed</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics.recentDeliveries}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <Clock size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Recent Activities</p>
                                    <p className="text-2xl font-bold text-gray-900">{metrics.activitiesCount}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Activity size={24} className="text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Recent Activities Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Activity size={20} className="mr-2" />
                                Recent Activities
                            </h2>
                            <span className="text-sm text-gray-500">
                                Last 10 activities
                            </span>
                        </div>
                        
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div 
                                        key={activity._id || index} 
                                        className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-900">
                                                {activity.event_type?.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {activity.event_time ? formatDateTime(activity.event_time) : '-'}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {activity.parcel_id?.tracking_code && (
                                                <div className="mb-1">
                                                    Tracking: {activity.parcel_id.tracking_code}
                                                </div>
                                            )}
                                            {activity.notes && (
                                                <div className="text-gray-500 italic">
                                                    {activity.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No recent activities found</p>
                            </div>
                        )}
                    </section>

                    {/* Additional Information Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Calendar size={20} className="mr-2" />
                            Account Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">Account Created</span>
                                <span className="text-gray-900 font-medium">
                                    {staff?.createdAt ? formatDate(staff.createdAt) : '-'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">Last Updated</span>
                                <span className="text-gray-900 font-medium">
                                    {staff?.updatedAt ? formatDateTime(staff.updatedAt) : '-'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">Account Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    staff?.active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {staff?.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600">Role</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    staff?.role === 'manager' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {staff?.role?.charAt(0).toUpperCase() + staff?.role?.slice(1)}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Edit Modal */}
                {editing && staff && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Staff</h2>
                                <button 
                                    onClick={() => setEditing(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateStaff}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Employee ID *
                                        </label>
                                        <input
                                            type="text"
                                            name="employee_id"
                                            value={formData.employee_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role *
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="manager">Manager</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned Hub
                                        </label>
                                        <select
                                            name="current_hub"
                                            value={formData.current_hub}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">Select a hub</option>
                                            {hubs.map(hub => (
                                                <option key={hub._id} value={hub._id}>
                                                    {hub.name || hub.hub_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            id="active"
                                            checked={formData.active}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                            Active Account
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        Update Staff
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}