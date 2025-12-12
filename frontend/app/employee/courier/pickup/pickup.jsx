
"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { Play, CheckSquare, MapPin, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import react from "react"

export default function Parcel() {
    const router = useRouter()
    
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<Play />} text="Dashboard" onClick={() => router.push('/employee/courier/dashboard')}/>
                <SidebarItem icon={<Package />} text="Parcel" onClick={() => router.push('/employee/courier/parcel')}/>
                <SidebarItem icon={<Package />} text="Parcels" onClick={() => router.push('/employee/courier/parcels')}/>
                <SidebarItem icon={<MapPin />} text="Route" onClick={() => router.push('/employee/courier/route')}/>
                <SidebarItem icon={<MapPin />} text="Pickup" active/>
            </Sidebar>
        </div>
    )
}