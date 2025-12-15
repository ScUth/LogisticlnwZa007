"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse, Users } from "lucide-react"
import React from "react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function routeDetails() {
    const router = useRouter()
    const [routeManagement, setRouteManagement] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826"}/api/admin/routes`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch routes')
                const data = await res.json()
                const rows = (data.routes || []).map(r => ({
                    route_id: r._id,
                    courier_id: r.courier ? (r.courier.employee_id || `${r.courier.first_name || ''} ${r.courier.last_name || ''}`).trim() : '-',
                    hub_id: r.hub ? (r.hub.hub_name || r.hub.name) : '-',
                    parcel_id: r.parcel_count || '-',
                    start_time: r.route_date || '-',
                    end_time: '-',
                    status: r.status || '-'
                }))
                setRouteManagement(rows)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const completed = (route_id) => {
        setRouteManagement((prev) => prev.map(rm => rm.route_id === route_id ? { ...rm, status: 'delivered' } : rm))
    }

    const outForDelivery = (route_id) => {
        setRouteManagement((prev) => prev.map(rm => rm.route_id === route_id ? { ...rm, status: 'out_for_delivery' } : rm))
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')} />
                <SubSidebarItem text="Route List" onClick={() => router.push('/admin/management/route/list')} />
                <SubSidebarItem text="Route Detail" active />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Route Details
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <BusFront className="text-amber-600" />
                            <div className="font-semibold text-[20px]">All Route</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Route ID</th>
                                    <th className="px-2 py-1 text-center">Courier ID</th>
                                    <th className="px-2 py-1 text-center">Hub ID</th>
                                    <th className="px-2 py-1 text-center">Parcel ID</th>
                                    <th className="px-2 py-1 text-center">Start Time</th>
                                    <th className="px-2 py-1 text-center">End Time</th>
                                    <th className="px-2 py-1 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="py-6 text-center text-gray-500">Loading…</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={7} className="py-6 text-center text-red-500">{error}</td></tr>
                                ) : routeManagement.slice(0, 6).map(rm => (
                                <tr key={rm.route_id} className="border-t">
                                    <td className="px-2 py-1 text-center">{rm.route_id}</td>
                                    <td className="px-2 py-1 text-center">{rm.courier_id}</td>
                                    <td className="px-2 py-1 text-center">{rm.hub_id}</td>
                                    <td className="px-2 py-1 text-center">{rm.parcel_id}</td>
                                    <td className="px-2 py-1 text-center">{rm.start_time}</td>
                                    <td className="px-2 py-1 text-center">{rm.end_time}</td>
                                    <td className="px-2 py-1 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => outForDelivery(rm.route_id)} disabled={rm.status === 'out_for_delivery' || rm.status === 'delivered'} className="text-sm px-2 py-1 rounded bg-yellow-500 text-white disabled:bg-gray-200">Out For Delivery</button>
                                            <button onClick={() => completed(rm.route_id)} disabled={rm.status === 'delivered'} className="text-sm px-2 py-1 rounded bg-lime-600 text-white disabled:bg-gray-200">Completed</button>
                                        </div>
                                    </td>
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
