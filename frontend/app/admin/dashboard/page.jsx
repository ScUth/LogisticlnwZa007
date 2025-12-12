"use client"

import { Boxes, BusFront, ClockAlert, FileChartColumn, Fullscreen, History, LayoutDashboard, MapPin, Package, Truck, User, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function adminDashboard() {
    const router = useRouter()
    const status = [
        { parcel_num: 42, status: 'picked up' },
        { parcel_num: 12, status: 'at origin hub' },
        { parcel_num: 23, status: 'out for delivery' },
        { parcel_num: 127, status: 'delivered' },
        { parcel_num: 2, status: 'canceled' },
    ]
    const late = [
        { parcel_id: '123', tracking_code: 123, sender_id: '123', recipient_id: '123', status: 'in linehaul', sla_due_dates: '2025-12-10' },
        { parcel_id: '127', tracking_code: 125, sender_id: '126', recipient_id: '124', status: 'at dest hub', sla_due_dates: '2025-12-11' },
    ]
    const routes = [
        { address_text: '123/45 หมู่บ้านไก่ย่าง', sub_district: 'เป็ดย่าง' },
        { address_text: '123/46 หมู่บ้านไก่ทอด', sub_district: 'เป็ดทอด' },
        { address_text: '123/89 หมู่บ้านไก่ต้ม', sub_district: 'เป็ดต้ม' },
    ]
    const drivers = [
        { employee_id: '123', fname: 'Alexander', lname: 'Bubu', phone: '0900900990' },
        { employee_id: '456', fname: 'Britney', lname: 'Spiw', phone: '1231231223' },
        { employee_id: '789', fname: 'Charlie', lname: 'Poo', phone: '4564564556' },
    ]
    const recent_scan_event = [
        { event_time: '2025-12-13 02:30:00', parcel_id: '123', hub_id: '213', courier_id: null, event_type: 'arrived hub' },
        { event_time: '2025-12-13 02:35:00', parcel_id: '127', hub_id: null, courier_id: '456', event_type: 'delivered' },
    ]

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50">
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
