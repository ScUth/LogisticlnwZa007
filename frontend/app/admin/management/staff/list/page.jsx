"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse, Users, Building, X } from "lucide-react"
import { useAdminAuth } from '@/context/adminAuthContext';
import Sidebar, { SidebarItem, SubSidebarItem } from '@/components/AdminSidebar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function StaffList() {
    const router = useRouter();
    const [staff, setStaff] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        hub: '',
        role: '',
        active: ''
    });

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        employee_id: '',
        role: 'staff',
        current_hub: '',
        active: true
    });

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch hubs
                const hubsRes = await fetch(`${API_BASE_URL}/api/admin/hubs`, {
                    credentials: 'include'
                });
                if (hubsRes.ok) {
                    const hubsData = await hubsRes.json();
                    setHubs(hubsData.hubs || []);
                }

                // Fetch staff
                await fetchStaff();

            } catch (err) {
                setError(err.message);
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Fetch staff with filters
    const fetchStaff = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.hub) params.append('hub', filters.hub);
            if (filters.role) params.append('role', filters.role);
            if (filters.active !== '') params.append('active', filters.active);

            const res = await fetch(`${API_BASE_URL}/api/admin/staff?${params}`, {
                credentials: 'include'
            });

            if (!res.ok) throw new Error(`Failed to fetch staff: ${res.status}`);
            
            const data = await res.json();
            setStaff(data.staff || []);
        } catch (err) {
            setError(err.message);
        }
    };

    // Apply filters
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchStaff();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [filters]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setSuccess(null);

            const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create staff');
            }

            setSuccess('Staff created successfully!');
            
            // Refresh staff list
            await fetchStaff();
            
            // Reset form
            setFormData({
                first_name: '',
                last_name: '',
                phone: '',
                password: '',
                employee_id: '',
                role: 'staff',
                current_hub: '',
                active: true
            });

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowCreate(false);
                setSuccess(null);
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    // Handle activate/deactivate
    const handleToggleActive = async (staffId, currentActive) => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/api/admin/staff/${staffId}/active`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ active: !currentActive })
            });

            if (!res.ok) throw new Error('Failed to update status');
            
            // Update local state
            setStaff(prev => prev.map(s => 
                s._id === staffId ? { ...s, active: !currentActive } : s
            ));
            
            setSuccess(`Staff ${!currentActive ? 'activated' : 'deactivated'} successfully!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    // Clear messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                <SidebarItem icon={<Users />} text="Staff Management" active />
                <SubSidebarItem text="Staff List" active />
                <SubSidebarItem text="Staff Detail" onClick={() => router.push('/admin/management/staff/detail')} />
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>
            
            <div className="flex-1 overflow-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                        <p className="text-gray-600">Manage hub managers and staff members</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                            Create Staff
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {success && (
                    <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-800">
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search by name, phone, or ID..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hub
                            </label>
                            <select
                                value={filters.hub}
                                onChange={(e) => handleFilterChange('hub', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">All Hubs</option>
                                {hubs.map(hub => (
                                    <option key={hub._id} value={hub._id}>
                                        {hub.name || hub.hub_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">All Roles</option>
                                <option value="manager">Manager</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.active}
                                onChange={(e) => handleFilterChange('active', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Staff Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <p className="mt-3 text-gray-600">Loading staff...</p>
                    </div>
                ) : staff.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                        <p className="text-gray-600 mb-4">Get started by creating your first staff member.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Create Staff
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Staff Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned Hub
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {staff.map((s) => (
                                        <tr 
                                            key={s._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/admin/management/staff/detail?id=${s._id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {s.first_name} {s.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {s.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{s.employee_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    s.role === 'manager' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {s.current_hub ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {s.current_hub.name || s.current_hub.hub_name}
                                                        </div>
                                                        {s.current_hub.code && (
                                                            <div className="text-xs text-gray-500">
                                                                {s.current_hub.code}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    s.active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {s.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleActive(s._id, s.active);
                                                    }}
                                                    className={`mr-3 px-3 py-1 rounded text-sm ${
                                                        s.active 
                                                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                                >
                                                    {s.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/management/staff/detail?id=${s._id}`);
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create Staff Modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create New Staff</h2>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff}>
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
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
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
                                        onClick={() => setShowCreate(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        Create Staff
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}