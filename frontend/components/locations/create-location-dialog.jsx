"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StyledCheckbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function CreateLocationDialog({ userId, isOpen, onClose, onCreate, onSuccess }) {

  const [locationName, setLocationName] = useState("")
  const [addressText, setAddressText] = useState("")
  const [subDistrict, setSubDistrict] = useState("")
  const [usedForPickup, setUsedForPickup] = useState(false)

  const sub_district_options = [
    "Lat Yao",
    "Sena Nikhom",
    "Chan Kasem",
    "Chom Phon",
    "Chatuchak",
  ]

  useEffect(() => {
    if (isOpen) {
      setLocationName("")
      setAddressText("")
      setSubDistrict("")
      setUsedForPickup(false)
    }
  }, [isOpen])

  const handleCreateLocation = async () => {
    await onCreate({
      location_name: locationName,
      address_text: addressText,
      sub_district: subDistrict,
      used_for_pickup: usedForPickup,
    })
    if (onSuccess) {
      await onSuccess()
    }
    onClose()
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location Name</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sub District</label>
            <div className="flex items-center gap-x-4">
              <Select
                value={subDistrict}
                onValueChange={(value) => {
                  setSubDistrict(value);
                }}
              >
                <SelectTrigger className="w-2/5 mt-1">
                  <SelectValue placeholder="Select a sub district" />
                </SelectTrigger>
                <SelectContent>
                  {sub_district_options.map((district) => (
                    <SelectItem key={district} value={district} className="px-8">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center">
                <StyledCheckbox
                  checked={usedForPickup}
                  onCheckedChange={(checked) => setUsedForPickup(checked)}
                />
                <label className="ml-2 text-sm text-gray-700">Used for Pickup</label>
              </div>
            </div>
          </div>


          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLocation}
              className="px-4 py-2 bg-amber-600 text-white rounded-md"
            >
              Create
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

