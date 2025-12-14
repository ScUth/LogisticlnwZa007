"use client"

import React, { useState, useEffect } from 'react';

// Update props to include all necessary data
export default function CourierForm({ 
    initialData = {}, 
    onSubmit = () => { }, 
    onCancel = () => { }, 
    submitText = 'Save',
    provinces = [],
    companyVehicles = [],
    courierVehicles = [],
    onSearchVehicles = () => {},
    vehicleLoading = false,

}) {
    const [firstName, setFirstName] = useState(initialData.first_name || '');
    const [lastName, setLastName] = useState(initialData.last_name || '');
    const [phone, setPhone] = useState(initialData.phone || '');
    const [employeeId, setEmployeeId] = useState(initialData.employee_id || '');
    const [role, setRole] = useState(initialData.role || 'courier');
    const [VehicleUsed, setVehicleUsed] = useState(initialData.vehicle_type || 'None');
    const [active, setActive] = useState(typeof initialData.active === 'boolean' ? initialData.active : true);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState(initialData.password || "");
    
    // Vehicle state
    const [companyVehicle, setCompanyVehicle] = useState('');
    const [courierVehicle, setCourierVehicle] = useState({
        plate_raw: '',
        plate_no: '',
        province: '',
        vehicle_type: '',
        capacity_kg: '',
        owner: 'Courier'
    });
    const [otherVehicle, setOtherVehicle] = useState({
        plate_raw: '',
        plate_no: '',
        province: '',
        vehicle_type: '',
        capacity_kg: '',
        owner: 'Courier',
        custom_owner: ''
    });
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Vehicle types from schema
    const vehicleTypes = ["pickup", "motorcycle", "truck"];

    // Handle search input
    const handleSearchChange = (query, owner) => {
        setSearchQuery(query);
        onSearchVehicles(owner, query);
    };

    // Handle plate number input and normalize
    const handlePlateInput = (value, type) => {
        const normalizedPlate = value.replace(/\s+/g, '').toUpperCase();
        
        if (type === 'courier') {
            setCourierVehicle(prev => ({
                ...prev,
                plate_raw: value,
                plate_no: normalizedPlate
            }));
        } else if (type === 'other') {
            setOtherVehicle(prev => ({
                ...prev,
                plate_raw: value,
                plate_no: normalizedPlate
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (VehicleUsed === "None") {
            setError("Please select a vehicle type");
            return;
        }

        if (VehicleUsed === "Company" && !companyVehicle) {
            setError("Please select a company vehicle");
            return;
        }

        if (VehicleUsed === "Courier") {
            const requiredFields = ['plate_raw', 'province', 'vehicle_type', 'capacity_kg'];
            const missingFields = requiredFields.filter(field => !courierVehicle[field]);
            if (missingFields.length > 0) {
                setError(`Please fill all required fields for courier vehicle: ${missingFields.join(', ')}`);
                return;
            }
        }

        if (VehicleUsed === "Other") {
            const requiredFields = ['plate_raw', 'province', 'vehicle_type', 'capacity_kg', 'custom_owner'];
            const missingFields = requiredFields.filter(field => !otherVehicle[field]);
            if (missingFields.length > 0) {
                setError(`Please fill all required fields for other vehicle: ${missingFields.join(', ')}`);
                return;
            }
        }

        // Prepare the final payload
        const formData = {
            first_name: firstName,
            last_name: lastName,
            phone,
            employee_id: employeeId,
            role,
            active,
            vehicle_type: VehicleUsed,
            vehicle_details: null,
            password: password,
        };

        // Add vehicle-specific data
        switch(VehicleUsed) {
            case 'Company':
                formData.vehicle_details = {
                    vehicle_id: companyVehicle,
                    type: 'company'
                };
                break;
            case 'Courier':
                formData.vehicle_details = {
                    ...courierVehicle,
                    type: 'courier'
                };
                break;
            case 'Other':
                formData.vehicle_details = {
                    ...otherVehicle,
                    type: 'other'
                };
                break;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">IN DEV PROGRESS
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-sm text-gray-600">First name *</span>
                    <input 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded" 
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm text-gray-600">Last name *</span>
                    <input 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded" 
                        required
                    />
                </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-sm text-gray-600">Phone *</span>
                    <input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded" 
                        required
                    />
                </label>
                {/* SET FOR USE / NO NECESSARY TO CHANGE INTO PASSWORD TYPE */}
                <label className="block">
                    <span className="text-sm text-gray-600">Password *</span>
                    <input 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded" 
                        required
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-sm text-gray-600">Employee ID *</span>
                    <input 
                        value={employeeId} 
                        onChange={(e) => setEmployeeId(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded" 
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm text-gray-600">Vehicle Used *</span>
                    <select 
                        value={VehicleUsed} 
                        onChange={(e) => setVehicleUsed(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded"
                    >
                        <option value="None">Select Vehicle Type</option>
                        <option value="Company">Company Vehicle</option>
                        <option value="Courier">Courier's Own Vehicle</option>
                        <option value="Other">Other Vehicle</option>
                    </select>
                </label>
            </div>

            {/* Vehicle Selection Section */}
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-3">Vehicle Details</h3>
                
                {VehicleUsed === "Company" && (
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm text-gray-600">Search Company Vehicles</span>
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Search by plate number..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value, 'Company')}
                                    className="w-full mt-1 px-3 py-2 border rounded pr-10"
                                />
                                {vehicleLoading && (
                                    <div className="absolute right-3 top-3">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        </label>
                        
                        {companyVehicles.length > 0 && (
                            <div className="mt-2">
                                <span className="text-sm text-gray-600">Available Vehicles</span>
                                <div className="mt-1 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    {companyVehicles.map((vehicle) => (
                                        <div 
                                            key={vehicle._id}
                                            className={`p-2 border rounded cursor-pointer ${companyVehicle === vehicle._id ? 'bg-amber-100 border-amber-500' : 'bg-white'}`}
                                            onClick={() => setCompanyVehicle(vehicle._id)}
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-medium">{vehicle.plate_raw}</span>
                                                <span className="text-sm text-gray-500 capitalize">{vehicle.vehicle_type}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Capacity: {vehicle.capacity_kg} kg • {vehicle.province}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {VehicleUsed === "Courier" && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm text-gray-600">Plate Number *</span>
                                <input 
                                    value={courierVehicle.plate_raw}
                                    onChange={(e) => handlePlateInput(e.target.value, 'courier')}
                                    placeholder="e.g., กข-1234 กรุงเทพ"
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Normalized: {courierVehicle.plate_no || '-'}
                                </div>
                            </label>
                            <label className="block">
                                <span className="text-sm text-gray-600">Province *</span>
                                <select 
                                    value={courierVehicle.province}
                                    onChange={(e) => setCourierVehicle(prev => ({ ...prev, province: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">Select Province</option>
                                    {provinces.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm text-gray-600">Vehicle Type *</span>
                                <select 
                                    value={courierVehicle.vehicle_type}
                                    onChange={(e) => setCourierVehicle(prev => ({ ...prev, vehicle_type: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {vehicleTypes.map(type => (
                                        <option key={type} value={type} className="capitalize">{type}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm text-gray-600">Capacity (kg) *</span>
                                <input 
                                    type="number"
                                    value={courierVehicle.capacity_kg}
                                    onChange={(e) => setCourierVehicle(prev => ({ ...prev, capacity_kg: e.target.value }))}
                                    placeholder="e.g., 500"
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                    min="1"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {VehicleUsed === "Other" && (
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm text-gray-600">Owner *</span>
                            <input 
                                value={otherVehicle.custom_owner}
                                onChange={(e) => setOtherVehicle(prev => ({ ...prev, custom_owner: e.target.value }))}
                                placeholder="e.g., Rental Company, Friend, etc."
                                className="w-full mt-1 px-3 py-2 border rounded"
                                required
                            />
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm text-gray-600">Plate Number *</span>
                                <input 
                                    value={otherVehicle.plate_raw}
                                    onChange={(e) => handlePlateInput(e.target.value, 'other')}
                                    placeholder="e.g., กข-1234 กรุงเทพ"
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Normalized: {otherVehicle.plate_no || '-'}
                                </div>
                            </label>
                            <label className="block">
                                <span className="text-sm text-gray-600">Province *</span>
                                <select 
                                    value={otherVehicle.province}
                                    onChange={(e) => setOtherVehicle(prev => ({ ...prev, province: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">Select Province</option>
                                    {provinces.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm text-gray-600">Vehicle Type *</span>
                                <select 
                                    value={otherVehicle.vehicle_type}
                                    onChange={(e) => setOtherVehicle(prev => ({ ...prev, vehicle_type: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {vehicleTypes.map(type => (
                                        <option key={type} value={type} className="capitalize">{type}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm text-gray-600">Capacity (kg) *</span>
                                <input 
                                    type="number"
                                    value={otherVehicle.capacity_kg}
                                    onChange={(e) => setOtherVehicle(prev => ({ ...prev, capacity_kg: e.target.value }))}
                                    placeholder="e.g., 500"
                                    className="w-full mt-1 px-3 py-2 border rounded"
                                    required
                                    min="1"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className='flex justify-end'>
                {error && <div className="p-2 text-red-700 bg-red-100 rounded">{error}</div>}
            </div>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-3 py-2 border rounded hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
                    {submitText}
                </button>
            </div>
        </form>
    );
}