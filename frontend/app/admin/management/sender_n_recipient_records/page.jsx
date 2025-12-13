"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePen, SquarePlus, Truck, User, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()

    const sender = [
        { sender_id: '001', fname: 'Glu', lname: '', phone: '' },
        { sender_id: '002', fname: '', lname: '', phone: '' },
        { sender_id: '003', fname: '', lname: '', phone: '' },
        { sender_id: '004', fname: '', lname: '', phone: '' },
        { sender_id: '005', fname: '', lname: '', phone: '' },
    ]

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" active/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Sender & Recipient Records
                </div>

                {/* Senders */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <User className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Senders</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                    <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Sender ID</th>
                                    <th className="px-2 py-1 text-center">First Name</th>
                                    <th className="px-2 py-1 text-center">Last Name</th>
                                    <th className="px-2 py-1 text-center">Phone</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
