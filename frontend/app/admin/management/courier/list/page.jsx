"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse, X } from "lucide-react"
import { useAdminAuth } from '@/context/adminAuthContext';
import Sidebar, { SidebarItem, SubSidebarItem } from '@/components/AdminSidebar';
import CourierForm from '@/components/CourierForm';
import { fePointLight, form } from 'framer-motion/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function CourierList() {
    const router = useRouter();
    const [couriers, setCouriers] = useState([]);
    const [companyVehicles, setCompanyVehicles] = useState([]);
    const [courierVehicles, setCourierVehicles] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingCourier, setEditingCourier] = useState(null);
    const [vehicleLoading, setVehicleLoading] = useState(false);

    // Fetch all necessary data
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);

                // Fetch couriers
                const couriersResponse = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!couriersResponse.ok) {
                    throw new Error(`Failed to fetch couriers: ${couriersResponse.status}`);
                }
                const couriersData = await couriersResponse.json();
                setCouriers(couriersData.couriers || []);

                // Fetch provinces
                const provincesResponse = await fetch(`${API_BASE_URL}/api/admin/vehicles/provinces`, {
                    method: "GET",
                    credentials: "include",
                });

                if (provincesResponse.ok) {
                    const provincesData = await provincesResponse.json();
                    setProvinces(provincesData.provinces || []);
                }

            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        }

        loadAllData();
    }, []);

    // Function to search vehicles
    const searchVehicles = async (owner, query, vehicleType = '', province = '') => {
        setVehicleLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('owner', owner);
            if (query) params.append('search', query);
            if (vehicleType) params.append('vehicle_type', vehicleType);
            if (province) params.append('province', province);
            params.append('available', 'true');

            const response = await fetch(
                `${API_BASE_URL}/api/admin/vehicles?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (owner === 'Company') {
                    setCompanyVehicles(data.vehicles || []);
                } else if (owner === 'Courier') {
                    setCourierVehicles(data.vehicles || []);
                }
                return data.vehicles || [];
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to search vehicles');
            }
        } catch (error) {
            console.error('Error searching vehicles:', error);
            setError(error.message);
            return [];
        } finally {
            setVehicleLoading(false);
        }
    };

    // Handle form submission
    const handleCreateCourier = async (formData) => {
        try {
            setError(null);
            setSuccess(null);

            console.log('Submitting form data:', formData);
            // console.log('Submitting form vehicle_type data:', formData.vehicle_type);

            if (formData.vehicle_type === "Company") {
                const responseCourier = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        password: formData.password,
                        role: formData.role,
                        active: formData.active,
                        employee_id: formData.employee_id,
                    })
                });
                if (!responseCourier.ok) {
                    throw new Error(responseCourier.message);
                } else {
                    const createdCourier = await responseCourier.json();
                    // console.log("", createdCourier);
                    const responseVehicle = await fetch(`${API_BASE_URL}/api/admin/vehicles/${formData.vehicle_details.vehicle_id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            assigned_courier: createdCourier._id,
                        })
                    });

                    if (!responseVehicle.ok) {
                        setError(responseVehicle.message);
                        throw new Error(responseCourier.message);
                    }
                    setSuccess('Courier created successfully!');
                }
            }
            if (formData.vehicle_type === "Courier") {
                const responseCourier = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        password: formData.password,
                        role: formData.role,
                        active: formData.active,
                        employee_id: formData.employee_id,
                    })
                });
                if (!responseCourier.ok) {
                    throw Error(responseCourier.message);
                } else {
                    const createdCourier = await responseCourier.json();
                    const responseVehicle = await fetch(`${API_BASE_URL}/api/admin/vehicles`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            plate_raw: formData.vehicle_details.plate_raw,
                            province: formData.vehicle_details.province,
                            vehicle_type: formData.vehicle_details.vehicle_type,
                            capacity_kg: formData.vehicle_details.capacity_kg,
                            owner: formData.vehicle_details.owner,
                            assigned_courier: createdCourier._id
                        })
                    });

                    if (!responseVehicle.ok) {
                        setError(responseVehicle.message);
                        throw new Error(responseVehicle.message);
                    }
                    setSuccess('Courier created successfully!');
                }
            }
            if (formData.vehicle_type === "Other") {
                const responseCourier = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        password: formData.password,
                        role: formData.role,
                        active: formData.active,
                        employee_id: formData.employee_id,
                    })
                });
                if (!responseCourier.ok) {
                    throw Error(responseCourier.message);
                } else {
                    console.log(formData);
                    const createdCourier = await responseCourier.json();
                    const responseVehicle = await fetch(`${API_BASE_URL}/api/admin/vehicles`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            plate_raw: formData.vehicle_details.plate_raw,
                            province: formData.vehicle_details.province,
                            vehicle_type: formData.vehicle_details.vehicle_type,
                            capacity_kg: formData.vehicle_details.capacity_kg,
                            owner: formData.vehicle_details.owner,
                            assigned_courier: createdCourier._id,
                            notes: formData.vehicle_details.custom_owner,
                        })
                    });

                    if (!responseVehicle.ok) {
                        setError(responseVehicle.message);
                        throw new Error(responseVehicle.message);
                    }
                    setSuccess('Courier created successfully!');
                }
            }

            // Refresh couriers list
            const couriersResponse = await fetch(`${API_BASE_URL}/api/admin/couriers`, {
                method: "GET",
                credentials: "include",
            });

            if (couriersResponse.ok) {
                const couriersData = await couriersResponse.json();
                setCouriers(couriersData.couriers || []);
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowCreate(false);
                setSuccess(null);
            }, 2000);

        } catch (err) {
            setError(err.message);
            console.error('Failed to create courier:', err);
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
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')} />
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" active/>
                <SubSidebarItem text="Courier List" active />
                <SubSidebarItem text="Courier Detail" onClick={() => router.push('/admin/management/courier/detail')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>
            <div className="flex-1 overflow-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Courier Management</h1>
                    <div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                        >
                            Create Courier
                        </button>
                    </div>
                </div>

                {success && (
                    <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <p className="mt-2 text-gray-600">Loading couriers...</p>
                    </div>
                ) : couriers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No couriers found. Create your first courier!
                    </div>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Employee ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {couriers.map((c) => (
                                    <tr
                                        key={c._id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => router.push(`/admin/management/courier/detail?id=${c._id}`)}
                                    >
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCourier(c);
                                                    setShowEdit(true);
                                                }}
                                                className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <span>{c.first_name} {c.last_name}</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{c.employee_id}</td>
                                        <td className="px-4 py-3">{c.phone}</td>
                                        <td className="px-4 py-3">
                                            {c.active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Create Courier</h2>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <CourierForm
                            onSubmit={handleCreateCourier}
                            onCancel={() => setShowCreate(false)}
                            submitText="Create Courier"
                            provinces={provinces}
                            companyVehicles={companyVehicles}
                            courierVehicles={courierVehicles}
                            onSearchVehicles={searchVehicles}
                            vehicleLoading={vehicleLoading}
                        />
                    </div>
                </div>
            )}

            {/* Edit modal (looks like Create) */}
            {showEdit && editingCourier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Edit Courier</h2>
                            <button
                                onClick={() => { setShowEdit(false); setEditingCourier(null); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <CourierForm
                            initialData={editingCourier}
                            onSubmit={(payload) => {
                                // No backend update implemented yet — just close and update locally
                                console.log('Edit payload:', payload);
                                setCouriers((prev) => prev.map(it => (it._id === editingCourier._id ? { ...it, ...payload } : it)));
                                setShowEdit(false);
                                setEditingCourier(null);
                            }}
                            onCancel={() => { setShowEdit(false); setEditingCourier(null); }}
                            submitText="Update Courier"
                            provinces={provinces}
                            companyVehicles={companyVehicles}
                            courierVehicles={courierVehicles}
                            onSearchVehicles={searchVehicles}
                            vehicleLoading={vehicleLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}