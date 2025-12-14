"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function RouteCreate({ open, onClose, onCreate }) {
    const [routeId, setRouteId] = React.useState("")
    const [courierId, setCourierId] = React.useState("")
    const [hubId, setHubId] = React.useState("")
    const [startTime, setStartTime] = React.useState("")
    const [endTime, setEndTime] = React.useState("")
    const [status, setStatus] = React.useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        onCreate({
            route_id: routeId,
            courier_id: courierId,
            hub_id: hubId,
            start_time: startTime,
            end_time: endTime,
            status: status,
        })

        setRouteId("")
        setCourierId("")
        setHubId("")
        setStartTime("")
        setEndTime("")
        setStatus("")
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Route</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Route ID</span>
                        <input placeholder="e.g. R001" value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Courier ID</span>
                        <input placeholder="e.g. C001" value={courierId} onChange={(e) => setCourierId(e.target.value)} className="w-full px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Hub ID</span>
                        <input placeholder="e.g. H001" value={hubId} onChange={(e) => setHubId(e.target.value)} className="w-full px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Start Time</span>
                        <input placeholder="e.g. 2025-12-15 08:00:00" value={startTime} onChange={(e) => setStartTime(e.target.value)}className="w-full px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">End Time</span>
                        <input placeholder="e.g. 2025-12-15 08:00:00" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Status</span>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex flex-row w-full px-2 py-1 border-2 rounded-lg" required >
                            <option value="">Select status</option>
                            <option value="planned">Planned</option>
                            <option value="out_for_delivery">Out For Delivery</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </label>

                    <DialogFooter>
                        <button type="button" onClick={onClose} className="mt-4 px-2 py-1 border rounded-lg">Cancel</button>
                        <button type="submit" className="mt-4 px-2 py-1 border bg-amber-600 text-white rounded-lg">Submit</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
