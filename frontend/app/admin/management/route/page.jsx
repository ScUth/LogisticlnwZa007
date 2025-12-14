"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" active/>
                <SubSidebarItem text="Route List" onClick={() => router.push('/admin/management/route/list')} />
                <SubSidebarItem text="Route Detail" onClick={() => router.push('/admin/management/route/details')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Route Management
                </div>
            </main>
        </div>
    )
}
