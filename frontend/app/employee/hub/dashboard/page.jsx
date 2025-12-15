"use client"

import React, { useEffect, useState } from "react";
import { useEmployeeAuth } from "@/context/employeeAuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function HubDashboard() {
    const { employee, loading } = useEmployeeAuth();
    const [hub, setHub] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!employee || !employee.current_hub) return;
            setFetching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/employee/hubs/${employee.current_hub}`, { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch hub");
                const data = await res.json();
                setHub(data.hub || null);
            } catch (err) {
                console.error(err);
                setHub(null);
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [employee]);

    if (loading) return <div className="p-6">Loading...</div>;

    if (!employee) return <div className="p-6">Please sign in.</div>;
    if (employee.role !== "staff") return <div className="p-6">Access denied</div>;
    if (!employee.current_hub) return <div className="p-6">You are not assigned to any hub.</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">{hub ? `Dashboard — ${hub.name || hub.hub_name}` : "Hub Dashboard"}</h1>
            <div className="mt-4">
                {fetching && <div className="text-sm text-gray-500">Loading hub...</div>}
                {!fetching && hub && (
                    <div className="bg-white rounded shadow p-4">
                        <p className="text-sm text-gray-600">Address: {hub.address_text || '—'}</p>
                        <p className="text-sm text-gray-600">Sub district: {hub.sub_district || '—'}</p>
                        <div className="mt-4">
                            <p className="text-gray-700">(Hub controls and management UI go here)</p>
                        </div>
                    </div>
                )}
                {!fetching && !hub && <div className="text-sm text-gray-600">Hub not found.</div>}
            </div>
        </div>
    );
}
