"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function HubEdit({ open, onClose, hub, onUpdate }) {
    const [hubName, setHubName] = React.useState("")
    const [address, setAddress] = React.useState("")
    const [subDistrict, setSubDistrict] = React.useState("")
    const [status, setStatus] = React.useState("Active")
    const [originalHubName, setOriginalHubName] = React.useState("")

    React.useEffect(() => {
        if (hub) {
            setHubName(hub.hub_name)
            setOriginalHubName(hub.hub_name)
            setAddress(hub.address_text)
            setSubDistrict(hub.sub_district)
            setStatus(hub.status)
        }
    }, [hub])

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate({
            originalHubName,
            hub_name: hubName,
            address_text: address,
            sub_district: subDistrict,
            status,
        })

        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Hub</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Hub Name</span>
                        <input value={hubName} onChange={(e) => setHubName(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Address</span>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Sub District</span>
                        <input value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Status</span>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg">
                            <option value="Active">Active</option>
                            <option value="Not Active">Not Active</option>
                        </select>
                    </label>

                    <DialogFooter>
                        <button type="button" onClick={onClose} className="mt-4 px-2 py-1 border rounded-lg">Cancel</button>
                        <button type="submit" className="mt-4 px-2 py-1 bg-amber-600 text-white border rounded-lg">Save</button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    )
}
