"use client";

import { useState, useEffect } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/context/authContext";

export default function ShipmentPage() {

    const { user } = useAuth();
    console.log("Authenticated user:", user);
    console.log("User ID:", user ? user.first_name : "No user logged in");
    const [editingIndex, setEditingIndex] = useState(null);

    const [cart, setCart] = useState([]);
    const parcelSizes = [
        { id: "S", label: "Small", dim: "14 x 20 x 6", length: 14, width: 20, height: 6 },
        { id: "M", label: "Medium", dim: "40 x 45 x 26", length: 40, width: 45, height: 26 },
        { id: "L", label: "Large", dim: "150 x 200 x 150", length: 150, width: 200, height: 150 },
    ];


    const [formData, setFormData] = useState({
        senderName: "",
        senderAddress: "",
        senderContact: "",
        receiverName: "",
        receiverAddress: "",
        receiverContact: "",
        // parcel fields
        parcelType: "",
        parcelDesc: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        quantity: 1,
        declaredValue: "",
        shippingCost: 0,
    });

    // set sender name when user data is available
    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                senderName: `${user.first_name} ${user.last_name}`,
                senderContact: `${user.phone}`,
            }));
        }
    }, [user]);

    // simple shipping cost calc (base + per-kg or volumetric)
    useEffect(() => {
        const w = parseFloat(formData.weight) || 0;
        const l = parseFloat(formData.length) || 0;
        const wd = parseFloat(formData.width) || 0;
        const h = parseFloat(formData.height) || 0;
        const qty = parseInt(formData.quantity, 10) || 1;
        // volumetric weight (cm) / 5000
        const volumetric = (l * wd * h) / 5000;
        const chargeable = Math.max(w, volumetric);
        const base = 200; // base cost
        const perKg = 50; // rate per kg
        const cost = Math.round((base + chargeable * perKg) * qty);
        setFormData((prev) => ({ ...prev, shippingCost: cost }));
    }, [formData.weight, formData.length, formData.width, formData.height, formData.quantity]);

    const handleParcelChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <NavigationBar />
            <div className="flex justify-center">
                <div className="flex flex-col justify-center w-[800px] h-full mt-20 border rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold p-4 text-center">Shipment Form</h1>
                    {/* <h2 className="text-xl font-semibold p-4">Sender Information</h2> */}
                    <form className="flex flex-col p-4">

                        {/* Sender -> Recipient row */}
                        <div className="flex items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-md">
                                    <span className="font-bold">Sender</span>
                                </div>
                                <div>
                                    <div className="font-semibold">{formData.senderName || "--"}</div>
                                    <div className="text-sm text-gray-600">{formData.senderAddress || "Address not set"}</div>
                                    <div className="text-sm text-gray-600">{formData.senderContact || "Contact not set"}</div>
                                </div>
                            </div>

                            <div className="text-gray-400 font-semibold">to</div>

                            <div className="flex items-center gap-4">
                                <div className="w-28 h-28 rounded-full bg-green-600 text-white flex flex-col items-center justify-center shadow-md">
                                    <span className="font-bold">Recipient</span>
                                </div>
                                <div>
                                    <div className="font-semibold">{formData.receiverName || "--"}</div>
                                    <div className="text-sm text-gray-600">{formData.receiverAddress || "Address not set"}</div>
                                    <div className="text-sm text-gray-600">{formData.receiverContact || "Contact not set"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Hubs row */}
                        <div className="flex items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-800 text-white flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-sm">Original</span>
                                </div>
                                <div>
                                    <div className="font-semibold">Original Hub (auto)</div>
                                    <div className="text-sm text-gray-600">Auto-detected hub address</div>
                                </div>
                            </div>

                            <div className="flex-1" />

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-800 text-white flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-sm">Destination</span>
                                </div>
                                <div>
                                    <div className="font-semibold">Destination Hub (auto)</div>
                                    <div className="text-sm text-gray-600">Auto-detected destination address</div>
                                </div>
                            </div>
                        </div>

                        <label className="mb-2 font-semibold text-xl">Parcel</label>
                        <div className="flex justify-between mb-4 gap-3">
                            {parcelSizes.map(size => (
                                <button
                                    key={size.id}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            parcelType: size.label,
                                            length: size.length,
                                            width: size.width,
                                            height: size.height
                                        }));
                                    }}
                                    className={`border rounded-lg p-3 w-1/3 text-center shadow-sm 
                ${formData.parcelType === size.label ? "bg-blue-600 text-white" : "bg-white"}`}
                                >
                                    <div className="font-semibold">{size.label}</div>
                                    <span className="text-xs text-gray-700">{size.dim} cm</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleParcelChange} className="mt-1 border rounded w-full py-2 px-3" placeholder="0.0" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">Qty</label>
                                <input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleParcelChange} className="mt-1 border rounded w-full py-2 px-3" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!formData.parcelType) return alert("Please select a parcel size.");
                                    if (!formData.weight) return alert("Please enter weight.");

                                    const item = {
                                        parcelType: formData.parcelType,
                                        weight: formData.weight,
                                        length: formData.length,
                                        width: formData.width,
                                        height: formData.height,
                                        quantity: formData.quantity,
                                        cost: formData.shippingCost
                                    };

                                    if (editingIndex !== null) {
                                        // SAVE EDIT
                                        setCart(prev => {
                                            const updated = [...prev];
                                            updated[editingIndex] = item;
                                            return updated;
                                        });
                                        setEditingIndex(null);
                                    } else {
                                        // ADD NEW
                                        setCart(prev => [...prev, item]);
                                    }

                                    // Reset input fields (not size)
                                    setFormData(prev => ({
                                        ...prev,
                                        weight: "",
                                        quantity: 1,
                                        declaredValue: "",
                                        shippingCost: 0,
                                    }));
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                            >
                                {editingIndex !== null ? "Save Changes" : "Add to Cart"}
                            </button>
                        </div>
                    </form>
                    <div className="flex justify-between px-4">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded w-32 mx-auto mb-4 previous" onClick={() => history.back()}>
                            Previous
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded w-32 mx-auto mb-4">
                            Next
                        </button>
                    </div>
                </div>
                <div className="flex flex-col justify-center w-[400px] h-full mt-20 border rounded-lg shadow-lg">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Cart</h2>

                        {cart.length === 0 ? (
                            <p className="text-gray-500">No parcels added.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {cart.map((item, index) => (
                                    <div key={index} className="border rounded p-3 shadow-sm">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-semibold">{item.parcelType} Parcel</div>
                                                <div className="text-sm text-gray-700">
                                                    {item.length} × {item.width} × {item.height} cm
                                                </div>
                                                <div className="text-sm">Weight: {item.weight} kg</div>
                                                <div className="text-sm">Quantity: {item.quantity}</div>
                                                <div className="text-sm font-semibold">
                                                    Cost: {item.cost} THB
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {/* Edit */}
                                                <button
                                                    className="text-blue-600 hover:underline text-sm"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            parcelType: item.parcelType,
                                                            weight: item.weight,
                                                            length: item.length,
                                                            width: item.width,
                                                            height: item.height,
                                                            quantity: item.quantity,
                                                            shippingCost: item.cost,
                                                        }));
                                                        setEditingIndex(index);
                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                {/* Remove */}
                                                <button
                                                    className="text-red-600 hover:underline text-sm"
                                                    onClick={() => {
                                                        setCart(prev => prev.filter((_, i) => i !== index));
                                                        if (editingIndex === index) setEditingIndex(null);
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <hr className="my-3" />

                                <div className="font-bold text-lg">
                                    Total: {cart.reduce((sum, it) => sum + it.cost, 0)} THB
                                </div>

                                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-3">
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
