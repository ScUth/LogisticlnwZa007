"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePlus, Truck, User, Warehouse } from "lucide-react"
import EventCreate from "@/components/ScanEventsCreate"
import React from "react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function scanEvents() {
    const router = useRouter()
    const [openCreate, setOpenCreate] = React.useState(false)
    const [scanEvents, setScanEvents] = React.useState([
        { scan_id: 'SE001', tracking_code: 'P001', hub_id: null, courier_id: 'C001',  event_time: '2025-12-10 09:00:00', event_type: 'picked_up', note: null },
        { scan_id: 'SE002', tracking_code: 'P001', hub_id: 'H001', courier_id: null,  event_time: '2025-12-10 12:00:00', event_type: 'arrived_hub', note: null },
        { scan_id: 'SE003', tracking_code: 'P001', hub_id: 'H001', courier_id: null,  event_time: '2025-12-10 14:00:00', event_type: 'departed_hub', note: null },
        { scan_id: 'SE004', tracking_code: 'P001', hub_id: null, courier_id: 'C002',  event_time: '2025-12-11 08:00:00', event_type: 'out_for_delivery', note: null },
        { scan_id: 'SE005', tracking_code: 'P001', hub_id: null, courier_id: 'C002',  event_time: '2025-12-11 10:30:00', event_type: 'delivered', note: null },
        { scan_id: 'SE006', tracking_code: 'P002', hub_id: null, courier_id: 'C003',  event_time: '2025-12-11 09:00:00', event_type: 'picked_up', note: null },
        { scan_id: 'SE007', tracking_code: 'P002', hub_id: 'H002', courier_id: null,  event_time: '2025-12-11 13:00:00', event_type: 'arrived_hub', note: null },
        { scan_id: 'SE008', tracking_code: 'P002', hub_id: 'H002', courier_id: null,  event_time: '2025-12-11 15:00:00', event_type: 'departed_hub', note: null },
        { scan_id: 'SE009', tracking_code: 'P002', hub_id: null, courier_id: 'C004',  event_time: '2025-12-12 08:00:00', event_type: 'out_for_delivery', note: null },
        { scan_id: 'SE010', tracking_code: 'P002', hub_id: null, courier_id: 'C004',  event_time: '2025-12-12 11:00:00', event_type: 'failed_delivery', note: null },
        { scan_id: 'SE011', tracking_code: 'P002', hub_id: null, courier_id: 'C004',  event_time: '2025-12-12 14:00:00', event_type: 'returned_to_sender', note: null },
    ])

    const addEvent = (newEvent) => {
        setScanEvents((prev) => [...prev, newEvent])
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('admin/management/route')}/>
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
                                    {[...scanEvents].sort((a, b) => new Date(b.event_time) - new Date(a.event_time)).map(se => (
                                        <tr className="">
                                            <td className="px-2 py-1">{se.tracking_code}</td>
                                            <td className="px-2 py-1">{se.hub_id ?? "-"}</td>
                                            <td className="px-2 py-1">{se.courier_id ?? "-"}</td>
                                            <td className="px-2 py-1">{se.event_time}</td>
                                            <td className="px-2 py-1">{se.event_type}</td>
                                            <td className="px-2 py-1">{se.note ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
