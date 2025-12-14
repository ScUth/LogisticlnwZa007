"use client"

import React, { useEffect, useState } from "react"
import {
    Boxes,
    BusFront,
    Fullscreen,
    LayoutDashboard,
    Package,
    SquarePen,
    SquarePlus,
    Truck,
    User,
    Warehouse,
} from "lucide-react"

import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import HubCreate from "@/components/CreateHub"
import HubEdit from "@/components/EditHub"
import { useRouter } from "next/navigation"

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862"

export default function HubManagement() {
    const router = useRouter()

    const [hubs, setHubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedHub, setSelectedHub] = useState(null)

    /* -----------------------------------
       Fetch hubs (GET)
    ----------------------------------- */
    const fetchHubs = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`${API_BASE_URL}/api/admin/hubs`, {
                credentials: "include",
            })

            if (!res.ok) throw new Error("Failed to fetch hubs")

            const data = await res.json()

            const mapped = (data.hubs || []).map((h) => ({
                _id: h._id,
                hub_name: h.hub_name,
                address_text: h.address_text || "",
                sub_district: h.sub_district || "",
                active: !!h.active,
            }))

            setHubs(mapped)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHubs()
    }, [])

    /* -----------------------------------
       Add hub (POST)
    ----------------------------------- */
    const handleAddHub = (newHub) => {
        setHubs((prev) => [...prev, newHub])
    }

    /* -----------------------------------
       Update hub (local update)
    ----------------------------------- */
    const handleUpdateHub = (updatedHub) => {
        setHubs((prev) =>
            prev.map((h) => (h._id === updatedHub._id ? updatedHub : h))
        )
    }

    /* -----------------------------------
       Delete hub (DELETE)
    ----------------------------------- */
    const handleDeleteHub = async (hubId) => {
        if (!confirm("Delete this hub?")) return

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/admin/hubs/${hubId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            )

            if (!res.ok) throw new Error("Failed to delete hub")

            setHubs((prev) => prev.filter((h) => h._id !== hubId))
        } catch (err) {
            console.error(err)
            alert(err.message || "Delete failed")
        }
    }

    /* -----------------------------------
       Render
    ----------------------------------- */
    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem
                    icon={<LayoutDashboard />}
                    text="Dashboard"
                    onClick={() => router.push("/admin/dashboard")}
                />
                <SidebarItem icon={<Warehouse />} text="Hub Management" active />
                <SidebarItem
                    icon={<User />}
                    text="Record"
                    onClick={() => router.push("/admin/management/records")}
                />
                <SidebarItem
                    icon={<Package />}
                    text="Parcel Management"
                    onClick={() => router.push("/admin/management/parcel")}
                />
                <SidebarItem
                    icon={<BusFront />}
                    text="Route Management"
                    onClick={() => router.push("/admin/management/route")}
                />
                <SidebarItem
                    icon={<Truck />}
                    text="Courier Management"
                    onClick={() => router.push("/admin/management/courier")}
                />
                <SidebarItem
                    icon={<Boxes />}
                    text="Scan Event Management"
                    onClick={() => router.push("/admin/management/scan_event")}
                />
                <SidebarItem
                    icon={<Fullscreen />}
                    text="Proof of Delivery Management"
                    onClick={() => router.push("/admin/management/pod")}
                />
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">Hub Management</div>

                <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Warehouse className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Hubs</div>
                                <div className="text-[14px] text-gray-600">
                                    Manage all hubs
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setOpenCreate(true)}
                            className="flex gap-2 px-3 py-2 text-sm text-white bg-amber-600 rounded-lg"
                        >
                            <SquarePlus />
                            Create Hub
                        </button>
                    </div>

                    {loading && <div className="mt-6">Loading…</div>}
                    {error && <div className="mt-6 text-red-600">{error}</div>}

                    <div className="mt-6 space-y-3">
                        {hubs.map((h) => (
                            <div
                                key={h._id}
                                className="flex justify-between items-center p-3 border rounded-lg"
                            >
                                <div>
                                    <div className="font-semibold">{h.hub_name}</div>
                                    <div className="text-sm text-gray-500">
                                        {h.address_text} — {h.sub_district}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${h.active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {h.active ? "Active" : "Not Active"}
                                    </span>

                                    <button
                                        onClick={() => {
                                            setSelectedHub(h)
                                            setOpenEdit(true)
                                        }}
                                        className="flex gap-1 px-2 py-1 text-sm text-white bg-amber-600 rounded"
                                    >
                                        <SquarePen />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDeleteHub(h._id)}
                                        className="px-2 py-1 text-sm text-white bg-gray-700 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <HubCreate
                        open={openCreate}
                        onClose={() => setOpenCreate(false)}
                        onCreate={handleAddHub}
                    />

                    <HubEdit
                        open={openEdit}
                        onClose={() => setOpenEdit(false)}
                        hub={selectedHub}
                        onUpdate={handleUpdateHub}
                    />
                </div>
            </main>
        </div>
    )
}
