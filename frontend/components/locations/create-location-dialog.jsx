"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StyledCheckbox } from "@/components/ui/checkbox"
import { useLocation } from "@/lib/use-location"

export function CreateLocationDialog({ userId, isOpen, onClose }) {
  const { createLocation } = useLocation(userId)
  const [locationName, setLocationName] = useState("")
  const [addressText, setAddressText] = useState("")
  const [regionCode, setRegionCode] = useState("")
  const [usedForPickup, setUsedForPickup] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocationName("")
      setAddressText("")
      setRegionCode("")
      setUsedForPickup(false)
    }
  }, [isOpen])

  const handleCreateLocation = async () => {
    await createLocation({
      location_name: locationName,
      address_text: addressText,
      region_code: regionCode,
      used_for_pickup: usedForPickup,
    })
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
            <label className="block text-sm font-medium text-gray-700">Region Code</label>
            <input
              type="text"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex items-center">
            <StyledCheckbox
              checked={usedForPickup}
              onCheckedChange={(checked) => setUsedForPickup(checked)}
            />
            <label className="ml-2 text-sm text-gray-700">Used for Pickup</label>
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

