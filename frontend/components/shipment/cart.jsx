"use client";

import { useState } from "react";
import { Trash, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShipmentCart({
  usedLocation,
  onEditItem,
  items,
  loading,
  error,
  deleteItem,
  submitRequest,
  draftId,
}) {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSubmitRequest = async () => {
    try {
      if (!submitRequest || !draftId) return;
      await submitRequest(draftId);
      router.push("/shipment/requests");
    } catch (err) {
      console.error("Error submitting pickup request:", err);
    }
  }

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
            <ul className="p-4 max-h-[60vh] overflow-y-auto">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between py-2 border-b">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.recipient.first_name} {item.recipient.last_name} {item.recipient.phone}
                    </p>
                    {/* address show ... if too long */}
                    <p className="text-sm text-gray-600 truncate">{item.recipient.address_text}</p>
                    <p className="text-sm text-gray-600">{item.recipient.sub_district}</p>
                    <p className="text-sm text-gray-500">
                      {item.size} - {item.estimated_weight}g (x{item.quantity})
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 justify-between items-center py-2">
                    <button
                      onClick={() => onEditItem(item)}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                    >
                      <SquarePen size={24} />
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold mt-4 p-2">
              <span>Total:</span>
              <span>{totalPrice.toFixed(2)}</span>
            </div>
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={!draftId || items.length === 0 || loading}
                className="w-full mt-2 px-4 py-2 rounded-md text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}