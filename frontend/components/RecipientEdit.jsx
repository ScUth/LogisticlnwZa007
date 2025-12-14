"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"

export default function RecipientEdit({ open, onClose, recipient, onUpdate }) {
    const [recipientId, setRecipientId] = React.useState("")
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [address, setAddress] = React.useState("")
    const [subDistrict, setSubDistrict] = React.useState("")
    const [originalRecipientId, setOriginalRecipientId] = React.useState("")

    React.useEffect(() => {
        if (recipient) {
            setRecipientId(recipient.recipient_id)
            setOriginalRecipientId(recipient.recipient_id)
            setFirstName(recipient.fname)
            setLastName(recipient.lname)
            setPhone(recipient.phone)
            setAddress(recipient.address)
            setSubDistrict(recipient.sub_district)
        }
    }, [recipient])

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate({
            originalRecipientId,
            recipient_id: recipientId,
            fname: firstName,
            lname: lastName,
            phone: phone,
            address: address,
            sub_district: subDistrict,
        })

        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Recipient</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-[14px] text-gray-600">Recipient ID</span>
                        <input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
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

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Address</span>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
                    </label>

                    <label className="block">
                        <span className="text-[14px] text-gray-600">Sub District</span>
                        <input value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} className="w-full mt-2 px-2 py-1 border-2 rounded-lg" />
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
