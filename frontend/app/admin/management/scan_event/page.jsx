"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePlus, Truck, User, Warehouse, Users } from "lucide-react"
import EventCreate from "@/components/ScanEventsCreate"
import React from "react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function scanEvents() {
    const router = useRouter()
    const [openCreate, setOpenCreate] = React.useState(false)
    const [scanEvents, setScanEvents] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826"}/api/admin/scan-events`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch scan events')
                const data = await res.json()
                const events = (data.events || []).map(e => ({
                    ...e,
                    tracking_code: e.parcel?.tracking_code || '-',
                    hub_display: e.hub?.hub_name || e.hub?.name || '-',
                    courier_display: e.courier ? (e.courier.employee_id || `${e.courier.first_name || ''} ${e.courier.last_name || ''}`).trim() : '-',
                    event_time: e.event_time,
                    event_type: e.event_type,
                    note: e.notes || e.note || null
                }))
                setScanEvents(events)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const addEvent = (newEvent) => {
        setScanEvents((prev) => [...prev, newEvent])
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" active/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Scan Event Management
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Boxes className="text-amber-600" />
                            <div className="font-semibold text-[20px]">Recent Scan Event</div>
                        </div>

                        <div className="flex flex-row">
                            <button onClick={() => setOpenCreate(true)} className="flex flex-row gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePlus />Create Scan Event</button>
                            <EventCreate open={openCreate} onClose={() => setOpenCreate(false)} onCreate={addEvent} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="overflow-x-auto border rounded-lg bg-white">
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="px-2 py-1">Tracking Code</th>
                                        <th className="px-2 py-1">Hub</th>
                                        <th className="px-2 py-1">Courier</th>
                                        <th className="px-2 py-1">Time</th>
                                        <th className="px-2 py-1">Type</th>
                                        <th className="px-2 py-1">Note</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="py-6 text-center text-gray-500">Loading…</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={6} className="py-6 text-center text-red-500">{error}</td></tr>
                                    ) : ([...scanEvents].sort((a, b) => new Date(b.event_time) - new Date(a.event_time)).map(se => (
                                        <tr key={se._id} className="">
                                            <td className="px-2 py-1">{se.tracking_code}</td>
                                            <td className="px-2 py-1">{se.hub_display ?? "-"}</td>
                                            <td className="px-2 py-1">{se.courier_display ?? "-"}</td>
                                            <td className="px-2 py-1">{se.event_time}</td>
                                            <td className="px-2 py-1">{se.event_type}</td>
                                            <td className="px-2 py-1">{se.note ?? "-"}</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
