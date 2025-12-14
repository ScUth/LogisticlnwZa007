"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function SenderEdit({ open, onClose, sender, onUpdate }) {
    const [senderId, setSenderId] = React.useState("")
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [originalSenderId, setOriginalSenderId] = React.useState("")

    React.useEffect(() => {
        if (sender) {
            setSenderId(sender.sender_id)
            setOriginalSenderId(sender.sender_id)
            setFirstName(sender.fname)
            setLastName(sender.lname)
            setPhone(sender.phone)
        }
    }, [sender])

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate({
            originalSenderId,
            sender_id: senderId,
            fname: firstName,
            lname: lastName,
            phone: phone,
        })

        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Sender</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Sender ID</span>
                        <input value={senderId} onChange={(e) => setSenderId(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">First Name</span>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Last Name</span>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Phone</span>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
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
