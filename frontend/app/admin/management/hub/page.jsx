"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePen, SquarePlus, Truck, User, Warehouse } from "lucide-react"
import React from "react"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()
    const [hub, setHub] = React.useState([
        { hub_name: 'Hub A', address_text: 'หมูทอด St', sub_district: 'แม่หมูทอด', status: 'Active' },
        { hub_name: 'Hub B', address_text: 'หมูย่าง St', sub_district: 'แม่หมูย่าง', status: 'Not Active' },
        { hub_name: 'Hub C', address_text: 'หมูปิ้ง St', sub_district: 'แม่หมูปิ้ง', status: 'Active' },
        { hub_name: 'Hub D', address_text: 'หมูนึ่ง St', sub_district: 'แม่หมูนึ่ง', status: 'Active' },
        { hub_name: 'Hub E', address_text: 'หมูต้ม St', sub_district: 'แม่หมูต้ม', status: 'Not Active' },
        { hub_name: 'Hub F', address_text: 'หมูตุ๋น St', sub_district: 'แม่หมูตุ๋น', status: 'Active' },
    ])

    const activate = (hub_name) => {
        setHub((prev) => prev.map(h => h.hub_name === hub_name ? { ...h, status: 'Active' } : h))
    }

    const deactivate = (hub_name) => {
        setHub((prev) => prev.map(h => h.hub_name === hub_name ? { ...h, status: 'Not Active' } : h))
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" active/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Hub Management
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Warehouse className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Hub</div>
                                <div className="text-[14px] text-gray-600">You can create, edit, activate, and deactivate all hubs</div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-2 ">
                            <div>
                                <button className="flex flex-row gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePlus />Create Hub</button>
                            </div>

                            <div>
                                <button className="flex flex-row gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePen />Edit Hub</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {hub.slice(0, 7).map(h => (
                            <div className="flex flex-row items-center justify-between mt-2 px-2 py-2 border border-gray-400 rounded-lg">
                                <div>
                                    <div className="font-semibold text-[18px]">{h.hub_name}</div>
                                    <div className="text-[14px] text-gray-500">{h.address_text} - {h.sub_district}</div>
                                </div>

                                <div className="flex flex-row gap-2">
                                    <div className={`text-[12px] px-2 py-1 rounded-full ${h.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{h.status}</div>
                                    <button onClick={() => activate(h.hub_name)} disabled={h.status !== 'Not Active'} className="text-sm px-2 py-1 rounded bg-lime-600 text-white disabled:bg-gray-200">Activate</button>
                                    <button onClick={() => deactivate(h.hub_name)} disabled={h.status !== 'Active'} className="text-sm px-2 py-1 rounded bg-red-600 text-white disabled:bg-gray-200">Deactivate</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
