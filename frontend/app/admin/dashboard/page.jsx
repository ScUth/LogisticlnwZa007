"use client"

import { Boxes, BusFront, ClockAlert, FileChartColumn, Fullscreen, History, LayoutDashboard, MapPin, Package, Truck, User, Warehouse, Users } from "lucide-react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826";

export default function adminDashboard() {
    const router = useRouter()
    const [status, setStatus] = useState([])
    const [late, setLate] = useState([])
    const [routes, setRoutes] = useState([])
    const [drivers, setDrivers] = useState([])
    const [recent_scan_event, setRecentScanEvent] = useState([])

    useEffect(() => {

        const fetchParcels = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/parcels`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch parcels')
                const data = await res.json()
                const parcels = data.parcels || []

                // status counts
                const counts = parcels.reduce((acc, p) => {
                    const s = p.status || 'unknown'
                    acc[s] = (acc[s] || 0) + 1
                    return acc
                }, {})
                const statusArray = Object.keys(counts).map(k => ({ parcel_num: counts[k], status: k }))
                setStatus(statusArray)

                // late deliveries (sla_due_at in past and not delivered)
                const now = new Date()
                const lateList = parcels.filter(p => p.sla_due_at && new Date(p.sla_due_at) < now && p.status !== 'delivered')
                    .slice(0, 5)
                    .map(p => ({ parcel_id: p._id, tracking_code: p.tracking_code, sender_id: p.sender?.phone || '', recipient_id: p.recipient?.phone || '', status: p.status, sla_due_dates: p.sla_due_at }))
                setLate(lateList)
            } catch (err) {
                console.error('Parcels fetch error', err)
                setStatus([])
                setLate([])
            }
        }

        const fetchRoutes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/routes`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch routes')
                const data = await res.json()
                const mapped = (data.routes || []).slice(0, 5).map(r => ({ address_text: r.hub?.address_text || r.hub?.hub_name || '', sub_district: r.hub?.sub_district || '' }))
                setRoutes(mapped)
            } catch (err) {
                console.error('Routes fetch error', err)
                setRoutes([])
            }
        }

        const fetchDrivers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/couriers`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch couriers')
                const data = await res.json()
                const mapped = (data.couriers || []).slice(0, 5).map(c => ({ employee_id: c.employee_id, fname: c.first_name, lname: c.last_name, phone: c.phone }))
                setDrivers(mapped)
            } catch (err) {
                console.error('Couriers fetch error', err)
                setDrivers([])
            }
        }

        const fetchScanEvents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/scan-events`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch scan events')
                const data = await res.json()
                const mapped = (data.events || []).slice(0, 5).map(e => ({ event_time: e.event_time, parcel_id: e.parcel?.tracking_code || e.parcel_id, hub_id: e.hub?.hub_name || e.hub_id, courier_id: e.courier?.employee_id || e.courier_id, event_type: e.event_type }))
                setRecentScanEvent(mapped)
            } catch (err) {
                console.error('Scan events fetch error', err)
                setRecentScanEvent([])
            }
        }

        fetchParcels()
        fetchRoutes()
        fetchDrivers()
        fetchScanEvents()

    }, [])

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Dashboard Overview
                </div>

                {/* Count of Parcels by Status */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row gap-2">
                        <FileChartColumn className="text-amber-600" />
                        <div className="font-semibold text-[18px]">
                            Parcels Status
                        </div>
                    </div>

                    <div className="mt-3">
                        <table className="w-2/3 table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Number of Parcels (pieces)</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody className="text-[14px]">
                                {status.slice(0, 6).map(s => (
                                    <tr className="border-4">
                                        <td className="px-2 py-1 text-center">{s.parcel_num}</td>
                                        <td className="px-2 py-1 text-center">{s.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Late Deliveries */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row gap-2">
                        <ClockAlert className="text-amber-600" />
                        <div className="font-semibold text-[18px]">
                            Late Deliveries
                        </div>
                    </div>

                    <div className="mt-3">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Parcel ID</th>
                                    <th className="px-2 py-1 text-center">Tracking Code</th>
                                    <th className="px-2 py-1 text-center">Sender ID</th>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                    <th className="px-2 py-1 text-center text-red-500">Due Dates</th>
                                </tr>
                            </thead>

                            <tbody className="text-[14px]">
                                {late.slice(0, 7).map(l => (
                                    <tr className="border-4">
                                        <td className="px-2 py-1 text-center">{l.parcel_id}</td>
                                        <td className="px-2 py-1 text-center">{l.tracking_code}</td>
                                        <td className="px-2 py-1 text-center">{l.sender_id}</td>
                                        <td className="px-2 py-1 text-center">{l.recipient_id}</td>
                                        <td className="px-2 py-1 text-center">{l.status}</td>
                                        <td className="px-2 py-1 text-center">{l.sla_due_dates}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-row mt-6 gap-6 w-full">
                    {/* Active Routes */}
                    <div className="p-6 w-1/2 border border-white bg-white rounded-lg shadow-lg">
                        <div className="flex flex-row gap-2">
                            <MapPin className="text-amber-600" />
                            <div className="font-semibold text-[18px]">
                                Active Routes
                            </div>
                        </div>

                        <div className="mt-3">
                            <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                                <thead className="font-semibold text-[16px] bg-gray-200">
                                    <tr>
                                        <th className="px-2 py-1 text-center">Address</th>
                                        <th className="px-2 py-1 text-center">Sub District</th>
                                    </tr>
                                </thead>

                                <tbody className="text-[14px]">
                                    {routes.slice(0, 4).map(ro => (
                                        <tr className="border-4">
                                            <td className="px-2 py-1 text-center">{ro.address_text}</td>
                                            <td className="px-2 py-1 text-center">{ro.sub_district}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Active Drivers */}
                    <div className="p-6 w-1/2 border border-white bg-white rounded-lg shadow-lg">
                        <div className="flex flex-row gap-2">
                            <Truck className="text-amber-600" />
                            <div className="font-semibold text-[18px]">
                                Active Drivers
                            </div>
                        </div>

                        <div className="mt-3">
                            <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                                <thead className="font-semibold text-[16px] bg-gray-200">
                                    <tr>
                                        <th className="px-2 py-1 text-center">Driver ID</th>
                                        <th className="px-2 py-1 text-center">First Name</th>
                                        <th className="px-2 py-1 text-center">Last Name</th>
                                        <th className="px-2 py-1 text-center">Phone Number</th>
                                    </tr>
                                </thead>

                                <tbody className="text-[14px]">
                                    {drivers.slice(0, 4).map(d => (
                                        <tr className="border-4">
                                            <td className="px-2 py-1 text-center">{d.employee_id}</td>
                                            <td className="px-2 py-1 text-center">{d.fname}</td>
                                            <td className="px-2 py-1 text-center">{d.lname}</td>
                                            <td className="px-2 py-1 text-center">{d.phone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Scan Events */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row gap-2">
                        <History className="text-amber-600" />
                        <div className="font-semibold text-[18px]">
                            Recent Scan Events
                        </div>
                    </div>

                    <div className="mt-3">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Event Time</th>
                                    <th className="px-2 py-1 text-center">Parcel ID</th>
                                    <th className="px-2 py-1 text-center">Hub ID</th>
                                    <th className="px-2 py-1 text-center">Courier ID</th>
                                    <th className="px-2 py-1 text-center">Event Type</th>
                                </tr>
                            </thead>

                            <tbody className="text-[14px]">
                                {recent_scan_event.slice(0, 3).map(rse => (
                                    <tr className="border-4">
                                        <td className="px-2 py-1 text-center">{rse.event_time}</td>
                                        <td className="px-2 py-1 text-center">{rse.parcel_id}</td>
                                        <td className="px-2 py-1 text-center">{rse.hub_id}</td>
                                        <td className="px-2 py-1 text-center">{rse.courier_id}</td>
                                        <td className="px-2 py-1 text-center">{rse.event_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
