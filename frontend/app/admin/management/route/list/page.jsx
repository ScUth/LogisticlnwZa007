"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Search, SquarePlus, Truck, User, Warehouse, Users } from "lucide-react"
import React from "react"
import RouteCreate from "@/components/RouteCreate"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()
    const [openCreate, setOpenCreate] = React.useState(false)

    const [route, setRoute] = React.useState([])
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
                    start_time: r.route_date || '-',
                    end_time: '-',
                    status: r.status || '-'
                }))
                setRoute(rows)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const addRoute = (newRoute) => {
        setRoute((prev) => [...prev, newRoute])
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
                <SubSidebarItem text="Route List" active />
                <SubSidebarItem text="Route Detail" onClick={() => router.push('/admin/management/route/details')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Route List
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Search className="text-amber-600" />
                            <div className="font-semibold text-[20px]">Search Route</div>
                        </div>

                        <div className="flex flex-row">
                            <button onClick={() => setOpenCreate(true)} className="flex flex-row gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePlus />Create Route</button>
                            <RouteCreate open={openCreate} onClose={() => setOpenCreate(false)} onCreate={addRoute} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-[16px] text-gray-600">Please input Courier ID, Hub ID, Status, and Date below</span>
                        <div className="flex w-full gap-2 mt-2">
                            <input className="w-1/4 px-2 py-1 border-2 rounded-lg" placeholder="Courier ID" />
                            <input className="w-1/4 px-2 py-1 border-2 rounded-lg" placeholder="Hub ID" />
                            <input className="w-1/4 px-2 py-1 border-2 rounded-lg" placeholder="Date YYYY-MM-DD" />
                            <select className="w-48 px-2 py-1 border-2 rounded-lg">
                                <option value="">Select status</option>
                                <option value="planned">Planned</option>
                                <option value="out_for_delivery">Out For Delivery</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                            <button className="px-2 py-1 bg-amber-600 text-white rounded">Search</button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="overflow-x-auto border rounded-lg bg-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="px-2 py-1">Route</th>
                                        <th className="px-2 py-1">Courier</th>
                                        <th className="px-2 py-1">Hub</th>
                                        <th className="px-2 py-1">Start Time</th>
                                        <th className="px-2 py-1">End Time</th>
                                        <th className="px-2 py-1">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="py-6 text-center text-gray-500">Loading…</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={6} className="py-6 text-center text-red-500">{error}</td></tr>
                                    ) : route.map(r => (
                                        <tr key={r.route_id} className="">
                                            <td className="px-2 py-1 text-left">{r.route_id}</td>
                                            <td className="px-2 py-1 text-left">{r.courier_id}</td>
                                            <td className="px-2 py-1 text-left">{r.hub_id}</td>
                                            <td className="px-2 py-1 text-left">{r.start_time}</td>
                                            <td className="px-2 py-1 text-left">{r.end_time}</td>
                                            <td className="px-2 py-1 text-left">{r.status}</td>
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
