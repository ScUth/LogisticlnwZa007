"use client";

import { useState, useEffect, use } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ListPickupLocationDialog({
  userId,
  isOpen,
  onClose,
  locations,
  usedLocation,
  onSelect,
  openCreateLocationDialog,
}) {
  const [selectedLocationId, setSelectedLocationId] = useState(usedLocation?._id || null);

  const handleSelectLocation = () => {
    const location = locations.find((loc) => loc._id === selectedLocationId);
    if (location) {
      onSelect(location);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedLocationId(usedLocation?._id || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Pickup Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {locations.length === 0 ? (
            <p>No saved locations found.</p>
          ) : (
            <ul>
              {locations.map((location) => (
                <li
                  key={location._id}
                  className={`p-4 border rounded-md cursor-pointer ${
                    selectedLocationId === location._id
                      ? "bg-amber-100 border-amber-500"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedLocationId(location._id)}
                >
                  <div className="">
                    <p className="font-semibold">{location.location_name}</p>
                    <p>{location.address_text}</p>
                    <p>{location.sub_district}, Chatuchak, Bangkok, 10900</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={openCreateLocationDialog}
          >
            + Add New Location
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-300"
            onClick={handleSelectLocation}
            disabled={!selectedLocationId}
          >
            Select
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
