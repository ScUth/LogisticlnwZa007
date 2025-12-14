"use client";

import { useState, useEffect } from "react";
import { usePickupRequest } from "@/lib/use-pickup-request";

export function ShipmentCart({ usedLocation }) {
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    draft,
    items,
    loading,
    error,
    getOrCreateDraft,
    addItem,
    getItems,
    updateItem,
    deleteItem,
    submitRequest,
  } = usePickupRequest();

  useEffect(() => {
    if (usedLocation?.address_text && usedLocation?.sub_district) {
      getOrCreateDraft({
        address_text: usedLocation.address_text,
        sub_district: usedLocation.sub_district,
      });
    }
  }, [usedLocation, getOrCreateDraft]);

  return (
    <div className="w-full">
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-amber-500 to-amber-200 border border-amber-500 p-4 rounded-t-lg text-gray-700 font-bold text-xl justify-center flex">
          <h2>Shipment Cart</h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-4 text-gray-400">Loading cart items...</div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : items.length === 0 ? (
          <div className="flex justify-center p-4 text-gray-400">Your shipment cart is empty</div>
        ) : (
          <div>
            <ul className="p-4">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between py-2 border-b">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.recipient.first_name} {item.recipient.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{item.recipient.address_text}</p>
                    <p className="text-sm text-gray-500">
                      {item.size} - {item.estimated_weight}g (x{item.quantity})
                    </p>
                  </div>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold mt-4 p-2">
              <span>Total:</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}