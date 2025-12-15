"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, SquarePlus, Truck, User, Warehouse, Users } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function hubManagement() {
    const router = useRouter()
    const [parcels, setParcels] = useState([])
    const [loadingParcels, setLoadingParcels] = useState(true)
    const [error, setError] = useState(null)

    const [showCreate, setShowCreate] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [editingParcel, setEditingParcel] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [hubQuery, setHubQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const [form, setForm] = useState({
        tracking_code: '',
        sender_first_name: '',
        sender_last_name: '',
        sender_phone: '',
        recipient_first_name: '',
        recipient_last_name: '',
        recipient_phone: '',
        origin_hub_id: '',
        dest_hub_id: '',
        weight_grams: '',
        declared_value: '',
        status: ''
    })

    const fetchParcels = async () => {
        try {
            setLoadingParcels(true)
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (statusFilter) params.append('status', statusFilter)
            if (hubQuery) params.append('hub', hubQuery)
            const res = await fetch(`${API_BASE_URL}/api/admin/parcels?${params.toString()}`, { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch parcels')
            const data = await res.json()
            setParcels(data.parcels || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoadingParcels(false)
        }
    }

    useEffect(() => { fetchParcels() }, [])

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" active/>
                <SubSidebarItem text="Parcel List" active />
                <SubSidebarItem text="Parcel Detail" onClick={() => router.push('/admin/management/parcel/details')} />
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" onClick={() => router.push('/admin/management/pod')}/>
            </Sidebar>

            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">
                    Parcel List
                </div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <div className="flex flex-row items-center gap-2 justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Package className="text-amber-600" />
                            <div>
                                <div className="font-semibold text-[20px]">Search Parcels</div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            <div>
                                <button onClick={() => setShowCreate(true)} className="flex flex-row gap-2 px-2 py-1 text-[14px] text-white bg-amber-600 rounded-lg"><SquarePlus />Create New Parcel</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <span className="text-[16px] text-gray-600">Please input Tracking Code/Sender/Status below</span>
                        <div className="flex gap-2 mt-2">
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-2 py-1 border-2 rounded-lg" placeholder="Search by tracking, sender, status" />
                            <input value={hubQuery} onChange={(e) => setHubQuery(e.target.value)} className="w-40 px-2 py-1 border-2 rounded-lg" placeholder="Hub ID" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48 px-2 py-1 border-2 rounded-lg">
                                <option value="">All status</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="at_origin_hub">At Origin Hub</option>
                                <option value="in_linehaul">In Linehaul</option>
                                <option value="at_dest_hub">At Destination Hub</option>
                                <option value="out_for_delivery">Out For Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed_delivery">Failed Delivery</option>
                                <option value="returned_to_sender">Returned To Sender</option>
                                <option value="canceled">Canceled</option>
                            </select>
                            <button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={() => fetchParcels()}>Search</button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="overflow-x-auto border rounded-lg bg-white">
                            {loadingParcels ? (
                                <div className="p-6 text-center">Loading parcels...</div>
                            ) : parcels.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No parcels found</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-3 py-2">Tracking</th>
                                            <th className="px-3 py-2">Sender</th>
                                            <th className="px-3 py-2">Recipient</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Origin Hub</th>
                                            <th className="px-3 py-2">Dest Hub</th>
                                            <th className="px-3 py-2">SLA</th>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Hub</th>
                                            <th className="px-3 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parcels.map(p => (
                                            <tr key={p._id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/management/parcel/details?id=${p._id}`)}>
                                                <td className="px-3 py-2">{p.tracking_code}</td>
                                                <td className="px-3 py-2">{p.sender?.first_name} {p.sender?.last_name}</td>
                                                <td className="px-3 py-2">{p.recipient?.first_name} {p.recipient?.last_name}</td>
                                                <td className="px-3 py-2">{p.status}</td>
                                                <td className="px-3 py-2">{p.origin_hub_id || '-'}</td>
                                                <td className="px-3 py-2">{p.dest_hub_id || '-'}</td>
                                                <td className="px-3 py-2">{p.sla_due_at ? new Date(p.sla_due_at).toLocaleDateString() : '-'}</td>
                                                <td className="px-3 py-2">{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                                                <td className="px-3 py-2">{p.origin_hub_id || p.dest_hub_id || '-'}</td>
                                                <td className="px-3 py-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingParcel(p); setShowEdit(true); }} className="px-2 py-1 text-sm border rounded">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Create Parcel</h2>
                                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowCreate(false)}>Close</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input placeholder="Tracking code" value={form.tracking_code} onChange={e => setForm({...form, tracking_code: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Weight (grams)" value={form.weight_grams} onChange={e => setForm({...form, weight_grams: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Declared value" value={form.declared_value} onChange={e => setForm({...form, declared_value: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Origin hub id" value={form.origin_hub_id} onChange={e => setForm({...form, origin_hub_id: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Dest hub id" value={form.dest_hub_id} onChange={e => setForm({...form, dest_hub_id: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender first name" value={form.sender_first_name} onChange={e => setForm({...form, sender_first_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender last name" value={form.sender_last_name} onChange={e => setForm({...form, sender_last_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender phone" value={form.sender_phone} onChange={e => setForm({...form, sender_phone: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient first name" value={form.recipient_first_name} onChange={e => setForm({...form, recipient_first_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient last name" value={form.recipient_last_name} onChange={e => setForm({...form, recipient_last_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient phone" value={form.recipient_phone} onChange={e => setForm({...form, recipient_phone: e.target.value})} className="border px-2 py-1" />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={async () => {
                                        try {
                                            const payload = {
                                                tracking_code: form.tracking_code,
                                                sender: { first_name: form.sender_first_name, last_name: form.sender_last_name, phone: form.sender_phone },
                                                recipient: { first_name: form.recipient_first_name, last_name: form.recipient_last_name, phone: form.recipient_phone },
                                                origin_hub_id: form.origin_hub_id,
                                                dest_hub_id: form.dest_hub_id,
                                                weight_grams: form.weight_grams,
                                                declared_value: form.declared_value,
                                                status: form.status
                                            }
                                            const res = await fetch(`${API_BASE_URL}/api/admin/parcels`, { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                            if (!res.ok) throw new Error('Failed to create parcel')
                                            await fetchParcels()
                                            setShowCreate(false)
                                            setForm({ tracking_code: '', sender_first_name: '', sender_last_name: '', sender_phone: '', recipient_first_name: '', recipient_last_name: '', recipient_phone: '', origin_hub_id: '', dest_hub_id: '', weight_grams: '', declared_value: '', status: '' })
                                        } catch (err) { setError(err.message) }
                                    }}>Create</button>
                                    <button className="px-3 py-1 border rounded" onClick={() => setShowCreate(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showEdit && editingParcel && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Edit Parcel</h2>
                                    <button className="text-gray-400 hover:text-gray-600" onClick={() => { setShowEdit(false); setEditingParcel(null); }}>Close</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input placeholder="Tracking code" defaultValue={editingParcel.tracking_code} onChange={e => setForm({...form, tracking_code: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Weight (grams)" defaultValue={editingParcel.weight_grams} onChange={e => setForm({...form, weight_grams: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Declared value" defaultValue={editingParcel.declared_value} onChange={e => setForm({...form, declared_value: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Status" defaultValue={editingParcel.status} onChange={e => setForm({...form, status: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Origin hub id" defaultValue={editingParcel.origin_hub_id} onChange={e => setForm({...form, origin_hub_id: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Dest hub id" defaultValue={editingParcel.dest_hub_id} onChange={e => setForm({...form, dest_hub_id: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender first name" defaultValue={editingParcel.sender?.first_name} onChange={e => setForm({...form, sender_first_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender last name" defaultValue={editingParcel.sender?.last_name} onChange={e => setForm({...form, sender_last_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Sender phone" defaultValue={editingParcel.sender?.phone} onChange={e => setForm({...form, sender_phone: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient first name" defaultValue={editingParcel.recipient?.first_name} onChange={e => setForm({...form, recipient_first_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient last name" defaultValue={editingParcel.recipient?.last_name} onChange={e => setForm({...form, recipient_last_name: e.target.value})} className="border px-2 py-1" />
                                    <input placeholder="Recipient phone" defaultValue={editingParcel.recipient?.phone} onChange={e => setForm({...form, recipient_phone: e.target.value})} className="border px-2 py-1" />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={async () => {
                                        try {
                                            const payload = {
                                                tracking_code: form.tracking_code || editingParcel.tracking_code,
                                                sender: { first_name: form.sender_first_name || editingParcel.sender?.first_name, last_name: form.sender_last_name || editingParcel.sender?.last_name, phone: form.sender_phone || editingParcel.sender?.phone },
                                                recipient: { first_name: form.recipient_first_name || editingParcel.recipient?.first_name, last_name: form.recipient_last_name || editingParcel.recipient?.last_name, phone: form.recipient_phone || editingParcel.recipient?.phone },
                                                origin_hub_id: form.origin_hub_id || editingParcel.origin_hub_id,
                                                dest_hub_id: form.dest_hub_id || editingParcel.dest_hub_id,
                                                weight_grams: form.weight_grams || editingParcel.weight_grams,
                                                declared_value: form.declared_value || editingParcel.declared_value,
                                                status: form.status || editingParcel.status
                                            }
                                            const res = await fetch(`${API_BASE_URL}/api/admin/parcels/${editingParcel._id}`, { method: 'PUT', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                                            if (!res.ok) throw new Error('Failed to update parcel')
                                            await fetchParcels()
                                            setShowEdit(false)
                                            setEditingParcel(null)
                                            setForm({ tracking_code: '', sender_first_name: '', sender_last_name: '', sender_phone: '', recipient_first_name: '', recipient_last_name: '', recipient_phone: '', origin_hub_id: '', dest_hub_id: '', weight_grams: '', declared_value: '', status: '' })
                                        } catch (err) { setError(err.message) }
                                    }}>Update</button>
                                    <button className="px-3 py-1 border rounded" onClick={() => { setShowEdit(false); setEditingParcel(null); }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
