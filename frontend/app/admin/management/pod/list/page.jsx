"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { format } from 'date-fns'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function PODList() {
    const router = useRouter()
    const [couriers, setCouriers] = useState([])
    const [selectedCourier, setSelectedCourier] = useState("")
    const [date, setDate] = useState("")
    const [proofs, setProofs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCouriers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/couriers`, { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to fetch couriers')
                const data = await res.json()
                setCouriers(data.couriers || [])
            } catch (err) {
                console.error(err)
            }
        }
        fetchCouriers()
        fetchProofs()
    }, [])

    const fetchProofs = async (params = {}) => {
        try {
            setLoading(true)
            setError(null)
            const qp = new URLSearchParams()
            if (params.courier || selectedCourier) qp.set('courier', params.courier || selectedCourier)
            if (params.date || date) qp.set('date', params.date || date)
            const res = await fetch(`${API_BASE_URL}/api/admin/pods?` + qp.toString(), { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch proofs')
            const data = await res.json()
            // ensure most recent first
            const sorted = (data.proofs || []).sort((a,b) => new Date(b.signed_at) - new Date(a.signed_at))
            setProofs(sorted)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally { setLoading(false) }
    }

    const handleSearch = (e) => {
        e?.preventDefault?.()
        fetchProofs({ courier: selectedCourier, date })
    }

    const resetFilters = () => { setSelectedCourier(''); setDate(''); fetchProofs({ courier: '', date: '' }) }

    const handleProofClick = (proofId) => {
        router.push(`/admin/management/pod/detail?id=${proofId}`)
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" active/>
                <SubSidebarItem text="Proof of Delivery List" active/>
                <SubSidebarItem text="Proof of Delivery Detail" onClick={() => router.push('/admin/management/pod/detail')}/>
            </Sidebar>
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="font-semibold text-[30px]">Proof of Delivery</div>

                <div className="mt-6 p-6 w-full border border-white bg-white rounded-lg shadow-lg">
                    <form className="flex gap-3 items-end" onSubmit={handleSearch}>
                        <div>
                            <label className="text-sm text-gray-600">Courier</label>
                            <select value={selectedCourier} onChange={(e) => setSelectedCourier(e.target.value)} className="block mt-1 px-2 py-1 border rounded">
                                <option value="">-- All Couriers --</option>
                                {couriers.map(c => (
                                    <option key={c._id} value={c._id}>({c.employee_id || c.phone}) {c.first_name} {c.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="block mt-1 px-2 py-1 border rounded" />
                        </div>

                        <div>
                            <button onClick={handleSearch} className="px-3 py-1 bg-amber-600 text-white rounded">Search</button>
                            <button type="button" onClick={resetFilters} className="ml-2 px-3 py-1 border rounded">Reset</button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                    {loading && <div className="text-gray-500">Loading...</div>}
                    {error && <div className="text-red-600">{error}</div>}
                    {!loading && proofs.length === 0 && <div className="text-gray-400">No entries</div>}

                    {proofs.map(p => (
                        <div 
                            key={p._id} 
                            className="p-4 bg-white rounded shadow flex gap-4 items-start cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleProofClick(p._id)}
                        >
                            <div style={{ width: 180, height: 240, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {p.photo_url ? (
                                    <img 
                                        src={p.photo_url} 
                                        alt={p.recipient_name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        className="hover:opacity-90 transition-opacity"
                                    />
                                ) : (
                                    <div className="text-gray-400">No photo</div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="font-semibold">{p.recipient_name}</div>
                                <div className="text-sm text-gray-600">Signed at: {p.signed_at ? format(new Date(p.signed_at), 'PPpp') : '-'}</div>
                                <div className="text-sm">Courier: {p.courier ? `${p.courier.first_name} ${p.courier.last_name}` : '-'}</div>
                                <div className="text-sm">Parcel: {p.parcel ? p.parcel.tracking_code : '-'}</div>
                                {p.notes && <div className="mt-2 text-sm text-gray-700">{p.notes}</div>}
                                <div className="mt-2 text-xs text-blue-600">Click to view details →</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
