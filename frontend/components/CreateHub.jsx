"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function HubCreate({ open, onClose, onCreate }) {
    const [hubName, setHubName] = React.useState("")
    const [address, setAddress] = React.useState("")
    const [subDistrict, setSubDistrict] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/hubs`, { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ hub_name: hubName, address_text: address, sub_district: subDistrict }) })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Failed to create hub')
            }
            const data = await res.json()
            const h = data.hub
            onCreate({ hub_name: h.hub_name, address_text: h.address_text || '', sub_district: h.sub_district || '', status: h.active ? 'Active' : 'Not Active', _id: h._id })
            setHubName("")
            setAddress("")
            setSubDistrict("")
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Hub</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Hub Name</span>
                        <input value={hubName} onChange={(e) => setHubName(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Address</span>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Sub District</span>
                        <input value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <DialogFooter>
                        <button type="button" onClick={onClose} className="mt-4 px-2 py-1 border rounded-lg">Cancel</button>
                        <button type="submit" className="mt-4 px-2 py-1 bg-amber-600 text-white border rounded-lg">Submit</button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    )
}
