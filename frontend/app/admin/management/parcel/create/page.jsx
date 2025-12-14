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
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SubSidebarItem text="Parcel List" onClick={() => router.push('/admin/management/parcel/list')} />
                <SubSidebarItem text="Create/Update Parcel" active />
                <SubSidebarItem text="Parcel Detail" onClick={() => router.push('/admin/management/parcel/details')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>
        </div>
    )
}
