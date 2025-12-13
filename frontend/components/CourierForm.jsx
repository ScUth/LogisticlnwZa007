"use client"

import React, { useState, useEffect } from 'react';

export default function CourierForm({ initialData = {}, onSubmit = () => { }, onCancel = () => { }, submitText = 'Save' }) {
    const [firstName, setFirstName] = useState(initialData.first_name || '');
    const [lastName, setLastName] = useState(initialData.last_name || '');
    const [phone, setPhone] = useState(initialData.phone || '');
    const [employeeId, setEmployeeId] = useState(initialData.employee_id || '');
    const [role, setRole] = useState(initialData.role || 'courier');
    const [vehicleType, setVehicleType] = useState(initialData.vehicle_type || '');
    const [active, setActive] = useState(typeof initialData.active === 'boolean' ? initialData.active : true);

    useEffect(() => {
        setFirstName(initialData.first_name || '');
        setLastName(initialData.last_name || '');
        setPhone(initialData.phone || '');
        setEmployeeId(initialData.employee_id || '');
        setRole(initialData.role || 'courier');
        setVehicleType(initialData.vehicle_type || '');
        setActive(typeof initialData.active === 'boolean' ? initialData.active : true);
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ first_name: firstName, last_name: lastName, phone, employee_id: employeeId, role, vehicle_type: vehicleType, active });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-sm text-gray-600">First name</span>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
                </label>
                <label className="block">
                    <span className="text-sm text-gray-600">Last name</span>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
                </label>
            </div>

            <label className="block">
                <span className="text-sm text-gray-600">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-sm text-gray-600">Employee ID</span>
                    <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
                </label>
                <label className="block">
                    <span className="text-sm text-gray-600">Role</span>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded">
                        <option value="courier">Courier</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                    </select>
                </label>
            </div>

            <label className="block">
                <span className="text-sm text-gray-600">Vehicle type</span>
                <input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
            </label>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
                    <span className="text-sm text-gray-600">Active</span>
                </label>
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded">{submitText}</button>
                <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
            </div>
        </form>
    );
}
