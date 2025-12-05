"use client";

import { useState, useEffect } from "react";
import { NavigationBar } from "../../../components/navbar";

export default function ShipmentPage() {
	const [formData, setFormData] = useState({
		senderName: "",
		senderAddress: "",
		senderContact: "",
		receiverName: "",
		receiverAddress: "",
		receiverContact: "",
	});

  return (
    <div>
      <NavigationBar />
      <div className="flex justify-center">
				<div className="flex flex-col justify-center w-[800px] h-full mt-20 border rounded-lg shadow-lg">
					<h1 className="text-2xl font-bold p-4 text-center">Shipment Form</h1>
					<h2 className="text-xl font-semibold p-4">Sender Information</h2>
					<form className="flex flex-col p-4">

						<label className="mb-2 font-semibold">Sender</label>
						<input
							type="text"
							className="border p-2 mb-4 rounded"
							placeholder="First and last name"
							value={formData.senderName}
							onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
						/>

						<label className="mb-2 font-semibold">Sender Address</label>
						<input type="text" className="border p-2 mb-4 rounded" />
						
						<label className="mb-2 font-semibold">Sender Contact</label>
						<input type="text" className="border p-2 mb-4 rounded" />
					</form>
					<h2 className="text-xl font-semibold p-4">Receiver Information</h2>
					<form className="flex flex-col p-4">
						<label className="mb-2 font-semibold">Receiver</label>
						<input
							type="text" 
							className="border p-2 mb-4 rounded" 
							placeholder="First and last name"
						/>
						<label className="mb-2 font-semibold">Receiver Address</label>
						<input type="text" className="border p-2 mb-4 rounded" />
						<label className="mb-2 font-semibold">Receiver Contact</label>
						<input type="text" className="border p-2 mb-4 rounded" />
					</form>
				</div>
			</div>
    </div>
  );
}
