"use client"
import { useRouter } from "next/navigation"
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"

export default function CourierManagement() {
    const router = useRouter()

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management"/>
                <SidebarItem icon={<User />} text="Sender & Recipient Record"/>
                <SidebarItem icon={<Package />} text="Parcel Management"/>
                <SidebarItem icon={<BusFront />} text="Route Management"/>
                <SidebarItem icon={<Truck />} text="Courier Management" active/>
                <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
                <SubSidebarItem text="Create Courier" onClick={() => router.push('/admin/management/courier/create')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management"/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management"/>
            </Sidebar>
            <div>
                Dashboard
            </div>
        </div>
    )
}