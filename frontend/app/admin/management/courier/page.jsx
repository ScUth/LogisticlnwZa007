"use client"
import { useRouter } from "next/navigation"
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"

export default function CourierManagement() {
    const router = useRouter()

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" active/>
                <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                <SubSidebarItem text="Create/Update Courier" onClick={() => router.push('/admin/management/courier/create')} />
                <SubSidebarItem text="Courier Detail" onClick={() => router.push('/admin/management/courier/detail')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>                
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>
            <div>
                Dashboard
            </div>
        </div>
    )
}