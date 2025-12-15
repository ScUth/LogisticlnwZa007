"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useEmployeeAuth } from "@/context/employeeAuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function HubEntry() {
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

    if (!employee) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Not signed in</h2>
                <p className="mt-2 text-gray-600">Please sign in as a hub staff to manage hubs.</p>
            </div>
        );
    }

    if (employee.role !== "staff") {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Access denied</h2>
                <p className="mt-2 text-gray-600">This area is for hub staff only.</p>
            </div>
        );
    }

    if (!employee.current_hub) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">No hub assigned</h2>
                <p className="mt-2 text-gray-600">You are not currently assigned to any hub. Contact an admin to set your hub.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Hub Management</h1>
            <div className="mt-4">
                {fetching && <div className="text-sm text-gray-500">Loading hub details...</div>}
                {!fetching && hub && (
                    <div className="bg-white rounded shadow p-4">
                        <h2 className="text-lg font-medium">{hub.name || hub.hub_name}</h2>
                        <div className="text-sm text-gray-600">{hub.address_text}</div>
                        <div className="mt-4">
                            <Link href="/employee/hub/dashboard" className="px-3 py-1 bg-amber-600 text-white rounded">Open Dashboard</Link>
                        </div>
                    </div>
                )}
                {!fetching && !hub && (
                    <div className="text-sm text-gray-600">Hub information not found.</div>
                )}
            </div>
        </div>
    );
}
