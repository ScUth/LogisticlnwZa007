"use client"

import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, User, Truck, Warehouse } from "lucide-react"
import { useRouter } from "next/navigation"
import CourierForm from '@/components/CourierForm'

export default function CreateCourierPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
        <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
        <SidebarItem icon={<User />} text="Sender & Recipient Record" onClick={() => router.push('/admin/management/sender_n_recipient_records')}/>
        <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
        <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
        <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
        <SubSidebarItem text="Courier List" onClick={() => router.push('/admin/management/courier/list')} />
        <SubSidebarItem text="Create Courier" active />
        <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
        <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
      </Sidebar>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto bg-white rounded p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Create Courier</h1>
          <CourierForm onSubmit={(payload) => {
            console.log('Create payload', payload);
            // implement API call later
            router.push('/admin/management/courier/list');
          }} onCancel={() => router.push('/admin/management/courier/list')} submitText="Create" />
        </div>
      </main>
    </div>
  )
}