"use client"

import React, { useEffect, useState } from "react";
import { useEmployeeAuth } from "@/context/employeeAuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function HubDashboard() {
    const { employee, loading, logout } = useEmployeeAuth();
    const [hub, setHub] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [parcels, setParcels] = useState([]);
    const [loadingParcels, setLoadingParcels] = useState(false);
    const [processingParcels, setProcessingParcels] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const load = async () => {
            if (!employee || !employee.current_hub) return;
            setFetching(true);
            try {
                console.log('[Hub Dashboard] Loading hub:', employee.current_hub);
                const res = await fetch(`${API_BASE_URL}/api/employee/hubs/${employee.current_hub}`, { credentials: "include" });
                const data = await res.json();
                
                if (!res.ok) {
                    console.error('[Hub Dashboard] Failed to fetch hub:', res.status, data);
                    setMessage({ type: 'error', text: data.message || 'Failed to fetch hub details' });
                    setHub(null);
                    return;
                }
                
                console.log('[Hub Dashboard] Hub loaded:', data.hub);
                setHub(data.hub || null);

                // fetch parcels for this hub
                setLoadingParcels(true);
                const pRes = await fetch(`${API_BASE_URL}/api/employee/hubs/${employee.current_hub}/parcels`, { credentials: 'include' });
                if (pRes.ok) {
                    const pData = await pRes.json();
                    console.log('[Hub Dashboard] Parcels loaded:', pData.data?.parcels?.length || 0);
                    setParcels(pData.data?.parcels || []);
                } else {
                    const pData = await pRes.json();
                    console.warn('[Hub Dashboard] Failed to fetch parcels:', pRes.status, pData);
                    setMessage({ type: 'error', text: pData.error || 'Failed to fetch parcels' });
                    setParcels([]);
                }
            } catch (err) {
                console.error('[Hub Dashboard] Load error:', err);
                setMessage({ type: 'error', text: err.message || 'Error loading hub data' });
                setHub(null);
            } finally {
                setFetching(false);
                setLoadingParcels(false);
            }
        };
        load();
    }, [employee]);

    const refreshParcels = async () => {
        if (!employee?.current_hub) return;
        try {
            const pRes = await fetch(`${API_BASE_URL}/api/employee/hubs/${employee.current_hub}/parcels`, { credentials: 'include' });
            if (pRes.ok) {
                const pData = await pRes.json();
                setParcels(pData.data?.parcels || []);
            }
        } catch (err) {
            console.error('Error refreshing parcels:', err);
        }
    };

    const handleProcessParcel = async (parcelId, action) => {
        setProcessingParcels(prev => ({ ...prev, [parcelId]: true }));
        try {
            const res = await fetch(`${API_BASE_URL}/api/employee/hubs/${hub._id}/process-parcel`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parcel_id: parcelId, action })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process parcel');
            setMessage({ type: 'success', text: data.data?.message || 'Parcel processed successfully' });
            await refreshParcels();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.message || 'Processing failed' });
        } finally {
            setProcessingParcels(prev => ({ ...prev, [parcelId]: false }));
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const getParcelActions = (parcel) => {
        if (!hub || !parcel) return [];
        
        const isOriginHub = String(parcel.origin_hub?._id) === String(hub._id);
        const isDestHub = String(parcel.dest_hub?._id) === String(hub._id);
        const actions = [];

        if (isOriginHub && parcel.status === 'at_origin_hub') {
            // At origin hub, ready to send to destination
            if (String(parcel.origin_hub._id) !== String(parcel.dest_hub._id)) {
                actions.push({
                    label: 'Send to Linehaul',
                    action: 'send_to_linehaul',
                    color: 'blue'
                });
            } else {
                // Same hub for origin and dest - prepare for local delivery
                actions.push({
                    label: 'Prepare for Delivery',
                    action: 'prepare_for_delivery',
                    color: 'green'
                });
            }
        }

        if (isDestHub && parcel.status === 'in_linehaul') {
            // Parcel in transit, confirm arrival at dest hub
            actions.push({
                label: 'Confirm Arrival',
                action: 'confirm_arrival',
                color: 'purple'
            });
        }

        if (isDestHub && parcel.status === 'at_dest_hub') {
            // At destination hub, prepare for delivery
            actions.push({
                label: 'Assign to Delivery Route',
                action: 'prepare_for_delivery',
                color: 'green'
            });
        }

        return actions;
    };

    if (loading) return <div className="p-6">Loading...</div>;

    if (!employee) return <div className="p-6">Please sign in.</div>;
    if (employee.role !== "staff") return <div className="p-6">Access denied. Your role: {employee.role}</div>;
    if (!employee.current_hub) return <div className="p-6">You are not assigned to any hub. Employee ID: {employee._id || employee.id}</div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">{hub ? `Dashboard — ${hub.name || hub.hub_name}` : "Hub Dashboard"}</h1>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
            
            {message && (
                <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="mt-4">
                {fetching && <div className="text-sm text-gray-500">Loading hub...</div>}
                {!fetching && hub && (
                    <div className="bg-white rounded shadow p-4">
                        <p className="text-sm text-gray-600">Address: {hub.address_text || '—'}</p>
                        <p className="text-sm text-gray-600">Sub district: {hub.sub_district || '—'}</p>
                        <div className="mt-4">
                            <p className="text-gray-700">(Hub controls and management UI go here)</p>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold">Parcels at this Hub</h2>
                            <p className="text-sm text-gray-600 mt-1">Process parcels based on their current status and destination</p>

                            {loadingParcels ? (
                                <div className="text-sm text-gray-500 mt-2">Loading parcels…</div>
                            ) : parcels.length === 0 ? (
                                <div className="text-sm text-gray-500 mt-2">No parcels found for this hub.</div>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {parcels.map(p => {
                                        const actions = getParcelActions(p);
                                        const isOriginHub = String(p.origin_hub?._id) === String(hub._id);
                                        const isDestHub = String(p.dest_hub?._id) === String(hub._id);
                                        
                                        return (
                                            <div key={p._id} className="p-4 border rounded-lg bg-white shadow-sm">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="font-mono font-semibold text-emerald-700">{p.tracking_code}</div>
                                                            <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                                p.status === 'at_origin_hub' ? 'bg-blue-100 text-blue-700' :
                                                                p.status === 'in_linehaul' ? 'bg-purple-100 text-purple-700' :
                                                                p.status === 'at_dest_hub' ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {p.status.replace(/_/g, ' ')}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Origin:</span> {p.origin_hub?.name || '-'}
                                                                {isOriginHub && <span className="ml-1 text-xs text-blue-600">(This hub)</span>}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Destination:</span> {p.dest_hub?.name || '-'}
                                                                {isDestHub && <span className="ml-1 text-xs text-green-600">(This hub)</span>}
                                                            </div>
                                                        </div>

                                                        {actions.length === 0 && (
                                                            <div className="mt-2 text-xs text-gray-500 italic">
                                                                No actions available for this parcel at your hub
                                                            </div>
                                                        )}
                                                    </div>

                                                    {actions.length > 0 && (
                                                        <div className="flex flex-col gap-2">
                                                            {actions.map((act, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleProcessParcel(p._id, act.action)}
                                                                    disabled={processingParcels[p._id]}
                                                                    className={`px-4 py-2 rounded font-medium text-sm text-white transition-colors disabled:opacity-50 ${
                                                                        act.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                                                        act.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                                        act.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                                                        'bg-gray-600 hover:bg-gray-700'
                                                                    }`}
                                                                >
                                                                    {processingParcels[p._id] ? 'Processing...' : act.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {!fetching && !hub && <div className="text-sm text-gray-600">Hub not found.</div>}
            </div>
        </div>
    );
}
