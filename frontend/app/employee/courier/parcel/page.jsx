"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { Play, CheckSquare, MapPin, Package, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import react from "react"

export default function Parcel() {
    const router = useRouter()
    
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<Play />} text="Dashboard" onClick={() => router.push('/employee/courier/dashboard')}/>
                <SidebarItem icon={<Package />} text="Parcel" active/>
                <SidebarItem icon={<Package />} text="Parcels" onClick={() => router.push('/employee/courier/parcels')}/>
                <SidebarItem icon={<MapPin />} text="Route" onClick={() => router.push('/employee/courier/route')}/>
                <SidebarItem icon={<Truck />} text="Pickup" onClick={() => router.push('/employee/courier/pickup')}/>
            </Sidebar>
        </div>
    )
}