"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function EventCreate({ open, onClose, onCreate }) {
    const [trackingCode, setTrackingCode] = React.useState("")
    const [hub, setHub] = React.useState("")
    const [courier, setCourier] = React.useState("")
    const [eventTime, setEventTime] = React.useState("")
    const [eventType, setEventType] = React.useState("")
    const [note, setNote] = React.useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        onCreate({
            tracking_code: trackingCode,
            hub_id: hub,
            courier_id: courier,
            event_time: eventTime,
            event_type: eventType,
            note: note,
        })

        setTrackingCode("")
        setHub("")
        setCourier("")
        setEventTime("")
        setEventType("")
        setNote("")
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Event</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Tracking Code</span>
                        <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" required />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Hub</span>
                        <input value={hub} onChange={(e) => setHub(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Courier</span>
                        <input value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Event Time</span>
                        <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Event Type</span>
                        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="flex flex-row w-full px-2 py-1 border-2 rounded-lg" required >
                            <option value="">Select Event Type</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="arrived_hub">Arrived At Hub</option>
                            <option value="departed_hub">Departed From Hub</option>
                            <option value="out_for_delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed_delivery">Failed Delivery</option>
                            <option value="returned_to_sender">Returned To Sender</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Note</span>
                        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <DialogFooter>
                        <button type="button" onClick={onClose} className="mt-4 px-2 py-1 border rounded-lg">Cencel</button>
                        <button type="submit" className="mt-4 px-2 py-1 border bg-amber-600 text-white rounded-lg">Submit</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}