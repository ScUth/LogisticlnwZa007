"use client";

import { useState, useEffect } from "react";

export function ShipmentCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  return (
    <div className="w-full">
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="bg-amber-600 p-4 rounded-t-lg text-white font-bold text-xl justify-center flex">
          <h2>Shipment Cart</h2>
        </div>
        {loading ? (
          <div className="flex justify-center p-4 text-gray-400">Loading cart items...</div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : cartItems.length === 0 ? (
          <div className="flex justify-center p-4 text-gray-400">Your shipment cart is empty</div>
        ) : (
          <div>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between py-2 border-b">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold mt-4">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}