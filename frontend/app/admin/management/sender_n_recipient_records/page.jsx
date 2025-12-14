"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePen, Truck, User, Warehouse } from "lucide-react"
import SenderEdit from "@/components/SenderEdit"
import Sidebar, { SidebarItem } from "@/components/AdminSidebar"
import React from "react"
import RecipientEdit from "@/components/RecipientEdit"
import { useRouter } from "next/navigation"

export default function hubManagement() {
    const router = useRouter()
    const [openEdit, setOpenEdit] = React.useState(false)
    const [selectedSender, setSelectedSender] = React.useState(null)
    const [selectedRecipient, setSelectedRecipient] = React.useState(null)
    const [sender, setSender] = React.useState([
        { sender_id: '001', fname: 'Gluteus', lname: 'Maximus', phone: '0110220033' },
        { sender_id: '002', fname: 'Rectus', lname: 'Femoris', phone: '0220330044' },
        { sender_id: '003', fname: 'Pronator', lname: 'Quadratus', phone: '0330440055' },
        { sender_id: '004', fname: 'Flexor', lname: 'Retinaculum', phone: '0440550066' },
        { sender_id: '005', fname: 'Flexor', lname: 'Digitorum', phone: '0550660077' },
    ])
    const [recipient, setRecipient] = React.useState([
        { recipient_id: '001', fname: 'Biceps', lname: 'Brachii', phone: '0660770088', address: '123 Muscle St.', sub_district: 'Flexor City' },
        { recipient_id: '002', fname: 'Triceps', lname: 'Brachii', phone: '0770880099', address: '123 Muscle St.', sub_district: 'Flexor City' },
        { recipient_id: '003', fname: 'Orbicularis', lname: 'Oculi', phone: '0880990010', address: '234 Bone St.', sub_district: 'Rectum City' },
        { recipient_id: '004', fname: 'Quadriceps', lname: 'Femoris', phone: '0990100011', address: '345 Eyes St.', sub_district: 'Skull City' },
        { recipient_id: '005', fname: 'Sartorius', lname: 'Muscle', phone: '0100110012', address: '456 Heart St.', sub_district: 'Cardio City' },
    ])

    const updateSender = (updatedSender) => {
        setSender((prev) => prev.map(s => s.sender_id === updatedSender.originalSenderId ? { sender_id: updatedSender.sender_id, fname: updatedSender.fname, lname: updatedSender.lname, phone: updatedSender.phone } : s))
    }

    const updateRecipient = (updatedRecipient) => {
        setRecipient((prev) => prev.map(r => r.recipient_id === updatedRecipient.originalRecipientId ? { recipient_id: updatedRecipient.recipient_id, fname: updatedRecipient.fname, lname: updatedRecipient.lname, phone: updatedRecipient.phone, address: updatedRecipient.address, sub_district: updatedRecipient.sub_district } : r))
    }

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
                                    <th className="px-2 py-1 text-center">Edit</th>
                                </tr>
                            </thead>

                            <tbody className="text-[14px]">
                                {sender.slice(0, 6).map(s => (
                                    <tr className="border-4">
                                        <td className="px-2 py-1 text-center">{s.sender_id}</td>
                                        <td className="px-2 py-1 text-center">{s.fname}</td>
                                        <td className="px-2 py-1 text-center">{s.lname}</td>
                                        <td className="px-2 py-1 text-center">{s.phone}</td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-center items-center">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedSender(s)
                                                        setOpenEdit(true)
                                                    }}
                                                    className="flex gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePen className="text-[14px]" />Edit Sender</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <SenderEdit open={openEdit} onClose={() => setOpenEdit(false)} sender={selectedSender} onUpdate={updateSender} />
                            </tbody>
                        </table>
                    </div>
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
                                {recipient.slice(0, 6).map(r => (
                                    <tr className="border-4">
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
                                ))}
                                <RecipientEdit open={openEdit} onClose={() => setOpenEdit(false)} recipient={selectedRecipient} onUpdate={updateRecipient} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
