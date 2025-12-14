"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePen, Truck, User, Warehouse } from "lucide-react"
import SenderEdit from "@/components/SenderEdit"
import Sidebar, { SubSidebarItem, SidebarItem } from "@/components/AdminSidebar"
import React from "react"
import RecipientEdit from "@/components/RecipientEdit"
import { useRouter } from "next/navigation"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function hubManagement() {
    const router = useRouter()
    const [openEdit, setOpenEdit] = React.useState(false)
    const [selectedSender, setSelectedSender] = React.useState(null)
    const [selectedRecipient, setSelectedRecipient] = React.useState(null)
    const [sender, setSender] = React.useState([])
    const [recipient, setRecipient] = React.useState([])
    const [loadingSenders, setLoadingSenders] = React.useState(true)
    const [loadingRecipients, setLoadingRecipients] = React.useState(true)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const fetchRecipients = async () => {
            try {
                setLoadingRecipients(true)
                const res = await fetch(`${API_BASE_URL}/api/admin/recipients`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch recipients')
                const data = await res.json()
                const mapped = (data.recipients || []).map(r => ({ recipient_id: r._id, fname: r.first_name, lname: r.last_name, phone: r.phone, address: r.address_text, sub_district: r.sub_district }))
                setRecipient(mapped)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoadingRecipients(false)
            }
        }

        fetchRecipients()
    }, [])

    const updateSender = (updatedSender) => {
        setSender((prev) => prev.map(s => s.sender_id === updatedSender.originalSenderId ? { sender_id: updatedSender.sender_id, fname: updatedSender.fname, lname: updatedSender.lname, phone: updatedSender.phone } : s))
    }

    const updateRecipient = (updatedRecipient) => {
        setRecipient((prev) => prev.map(r => r.recipient_id === updatedRecipient.originalRecipientId ? { recipient_id: updatedRecipient.recipient_id, fname: updatedRecipient.fname, lname: updatedRecipient.lname, phone: updatedRecipient.phone, address: updatedRecipient.address, sub_district: updatedRecipient.sub_district } : r))
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')} />
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')} />
                <SidebarItem icon={<User />} text="Record" active/>
                <SubSidebarItem text="Sender" onClick={() => router.push('/admin/management/records/sender')} />
                <SubSidebarItem text="Recipient" active/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('admin/management/route')} />
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')} />
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')} />
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')} />
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Recipient Records
                </div>

                {/* Recipient */}
                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <User className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">All Recipients</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <table className="w-full table-auto border-1 border-black rounded-lg overflow-hidden">
                            <thead className="font-semibold text-[16px] bg-gray-200">
                                <tr>
                                    <th className="px-2 py-1 text-center">Recipient ID</th>
                                    <th className="px-2 py-1 text-center">First Name</th>
                                    <th className="px-2 py-1 text-center">Last Name</th>
                                    <th className="px-2 py-1 text-center">Phone</th>
                                    <th className="px-2 py-1 text-center">Address</th>
                                    <th className="px-2 py-1 text-center">Sub District</th>
                                    <th className="px-2 py-1 text-center">Edit</th>
                                </tr>
                            </thead>

                            <tbody className="text-[14px]">
                                {loadingRecipients ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-3 text-gray-500">Loading...</td>
                                    </tr>
                                ) : recipient.length > 0 ? (
                                    recipient.slice(0, 6).map(r => (
                                        <tr className="border-4" key={r.recipient_id}>
                                            <td className="px-2 py-1 text-center">{r.recipient_id}</td>
                                            <td className="px-2 py-1 text-center">{r.fname}</td>
                                            <td className="px-2 py-1 text-center">{r.lname}</td>
                                            <td className="px-2 py-1 text-center">{r.phone}</td>
                                            <td className="px-2 py-1 text-center">{r.address}</td>
                                            <td className="px-2 py-1 text-center">{r.sub_district}</td>
                                            <td className="px-2 py-1">
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecipient(r)
                                                            setOpenEdit(true)
                                                        }}
                                                        className="flex gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg">
                                                        <SquarePen className="text-[14px]" />
                                                        Edit Recipient
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-3 text-gray-400">No recipients found</td>
                                    </tr>
                                )}
                                <RecipientEdit open={openEdit} onClose={() => setOpenEdit(false)} recipient={selectedRecipient} onUpdate={updateRecipient} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
