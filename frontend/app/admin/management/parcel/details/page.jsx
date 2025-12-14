"use client"

import { Boxes, BusFront, CircleSmall, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()
    const parcel_sender_recipient = [
        { parcel_id: 'P001', sender_id: 'S001', sender_fname: 'Gluteus', sender_lname: 'Maximus', recipient_id: 'R001', recipient_fname: 'Biceps', recipient_lname: 'Brachii'},
        { parcel_id: 'P002', sender_id: 'S002', sender_fname: 'Rectus', sender_lname: 'Femoris', recipient_id: 'R002', recipient_fname: 'Triceps', recipient_lname: 'Brachii'},
        { parcel_id: 'P003', sender_id: 'S003', sender_fname: 'Pronator', sender_lname: 'Quadratus', recipient_id: 'R003', recipient_fname: 'Orbicularis', recipient_lname: 'Oculi'},
        { parcel_id: 'P004', sender_id: 'S004', sender_fname: 'Flexor', sender_lname: 'Retinaculum', recipient_id: 'R004', recipient_fname: 'Quadriceps', recipient_lname: 'Femoris'},
        { parcel_id: 'P005', sender_id: 'S005', sender_fname: 'Flexor', sender_lname: 'Digitorum', recipient_id: 'R005', recipient_fname: 'Sartorius', recipient_lname: 'Muscle'},
    ]
    const parcel_hub = [
        { parcel_id: 'P001', hub_origin_id: 'H001', hub_origin_name: 'Hub A', hub_dest_id: 'H003', hub_dest_name: 'Hub C', route_id: 'RO001' },
        { parcel_id: 'P002', hub_origin_id: 'H001', hub_origin_name: 'Hub A', hub_dest_id: 'H004', hub_dest_name: 'Hub D', route_id: 'RO002' },
        { parcel_id: 'P003', hub_origin_id: 'H002', hub_origin_name: 'Hub B', hub_dest_id: 'H004', hub_dest_name: 'Hub D', route_id: 'RO003' },
        { parcel_id: 'P004', hub_origin_id: 'H002', hub_origin_name: 'Hub B', hub_dest_id: 'H005', hub_dest_name: 'Hub E', route_id: 'RO004' },
        { parcel_id: 'P005', hub_origin_id: 'H003', hub_origin_name: 'Hub C', hub_dest_id: 'H005', hub_dest_name: 'Hub E', route_id: 'RO005' },
    ]
    const parcel_events = [
        { parcel_id: 'P001', event_time: '2025-12-13 02:30:00', hub_id: null, courier_id: '456', event_type: 'delivered' },
        { parcel_id: 'P001', event_time: '2025-12-12 02:30:00', hub_id: null, courier_id: '456', event_type: 'out for delivery' },
        { parcel_id: 'P002', event_time: '2025-12-11 02:30:00', hub_id: '213', courier_id: null, event_type: 'at dest hub' },
        { parcel_id: 'P003', event_time: '2025-12-10 02:30:00', hub_id: '213', courier_id: null, event_type: 'at origin hub' },
        { parcel_id: 'P003', event_time: '2025-12-13 02:30:00', hub_id: null, courier_id: '456', event_type: 'delivered' },
        { parcel_id: 'P004', event_time: '2025-12-12 02:30:00', hub_id: null, courier_id: '456', event_type: 'out for delivery' },
        { parcel_id: 'P004', event_time: '2025-12-11 02:30:00', hub_id: '213', courier_id: null, event_type: 'at dest hub' },
        { parcel_id: 'P005', event_time: '2025-12-10 02:30:00', hub_id: '213', courier_id: null, event_type: 'at origin hub' },
        { parcel_id: 'P005', event_time: '2025-12-13 02:30:00', hub_id: null, courier_id: '456', event_type: 'delivered' },
    ]
    const parcel_proof_status = [
        { parcel_id: 'P001', recipient_id: 'R001', photo_url: 'proofP001.jpg', status: 'delivered' },
        { parcel_id: 'P002', recipient_id: 'R002', photo_url: 'proofP002.jpg', status: 'delivered' },
        { parcel_id: 'P003', recipient_id: 'R003', photo_url: 'proofP003.jpg', status: 'delivered' },
        { parcel_id: 'P004', recipient_id: 'R004', photo_url: 'proofP004.jpg', status: 'delivered' },
        { parcel_id: 'P005', recipient_id: 'R005', photo_url: 'proofP005.jpg', status: 'delivered' },
    ]

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SubSidebarItem text="Parcel List" onClick={() => router.push('/admin/management/parcel/list')} />
                <SubSidebarItem text="Create/Update Parcel" onClick={() => router.push('/admin/management/parcel/create')} />
                <SubSidebarItem text="Parcel Detail" active />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Parcel Details
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Package className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Parcels</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-[16px] text-gray-600">Please input Parcel ID below</span>
                        <input className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </div>
                </div>

                {/* Sender & Recipient */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <User className="text-amber-600" />
                        Sender & Recipient
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Sender ID</th>
                                    <th className="px-2 py-1 text-center">Sender Name</th>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">Recipient Name</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* Hub */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Warehouse className="text-amber-600" />
                        Hub & Route
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Origin Hub ID</th>
                                    <th className="px-2 py-1 text-center">Origin Hub Name</th>
                                    <th className="px-2 py-1 text-center">Destination Hub ID</th>
                                    <th className="px-2 py-1 text-center">Destination Hub Name</th>
                                    <th className="px-2 py-1 text-center">Route ID</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* Events */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Boxes className="text-amber-600" />
                        Events
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Event Time</th>
                                    <th className="px-2 py-1 text-center">Hub ID</th>
                                    <th className="px-2 py-1 text-center">Courier ID</th>
                                    <th className="px-2 py-1 text-center">Event Type</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* Proof & Status */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 font-semibold text-[20px]">
                        <Fullscreen className="text-amber-600" />
                        Proof & Status
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">Photo Proof</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                    <th className="px-2 py-1 text-center">Edit</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
