"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse } from "lucide-react"
import React from "react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function routeDetails() {
    const router = useRouter()
    const [routeManagement, setRouteManagement] = React.useState([
        { route_id: 'R001', courier_id: 'C001', hub_id: 'H001', parcel_id: 'P001', start_time: '2025-12-10 08:00:00', end_time: '2025-12-10 16:00:00', status: 'at_dest_hub' },
        { route_id: 'R002', courier_id: 'C002', hub_id: 'H002', parcel_id: 'P002', start_time: '2025-12-11 08:00:00', end_time: '2025-12-11 16:00:00', status: 'out_for_delivery' },
        { route_id: 'R003', courier_id: 'C003', hub_id: 'H003', parcel_id: 'P003', start_time: '2025-12-12 08:00:00', end_time: '2025-12-12 16:00:00', status: 'out_for_delivery' },
        { route_id: 'R004', courier_id: 'C004', hub_id: 'H004', parcel_id: 'P004', start_time: '2025-12-13 08:00:00', end_time: '2025-12-13 16:00:00', status: 'delivered' },
        { route_id: 'R005', courier_id: 'C005', hub_id: 'H005', parcel_id: 'P005', start_time: '2025-12-14 08:00:00', end_time: '2025-12-14 16:00:00', status: 'delivered' },
    ])

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
                                {routeManagement.slice(0, 6).map(rm => (
                                <tr className="border-t">
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
