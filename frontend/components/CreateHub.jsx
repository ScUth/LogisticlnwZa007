"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function HubCreate({ open, onClose, onCreate }) {
    const [hubName, setHubName] = React.useState("")
    const [address, setAddress] = React.useState("")
    const [subDistrict, setSubDistrict] = React.useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        onCreate({
            hub_name: hubName,
            address_text: address,
            sub_district: subDistrict,
            status: "Not Active",
        })

        setHubName("")
        setAddress("")
        setSubDistrict("")
        onClose()
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
