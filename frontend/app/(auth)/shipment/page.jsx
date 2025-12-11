"use client";

import { useState, useEffect } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/use-location";
import { CreateLocationDialog } from "@/components/locations/create-location-dialog";

export default function ShipmentPage() {

	const { user } = useAuth();
	const router = useRouter();

	const {
		locations,
		loading,
		error,
		locBySenderMessage,
		fetchLocationsBySenderId,
		createLocation,
		updateLocation,
		usedLocation,
		fetchSenderUsedLocation,
	} = useLocation(user?._id);

	const [openCreateLocationDialog, setOpenCreateLocationDialog] = useState(false);

	// console.log("Used locations state:", usedLocation);

	const testHandleFetchLocations = async () => {
		await fetchSenderUsedLocation();
		// console.log("Used locations:", usedLocation);
	}

	const [formData, setFormData] = useState({
		senderName: "",
		senderAddress: "",
		senderContact: "",
		receiverName: "",
		receiverAddress: "",
		receiverContact: "",
	});

	// set sender name when user data is available
	useEffect(() => {
		if (user) {
			setFormData((prevData) => ({
				...prevData,
				senderName: `${user.first_name} ${user.last_name}`,
				senderContact: `${user.phone}`,
			}));
		}
	}, [user]);

	const handleSubmit = (e) => {
		e.preventDefault();
		router.push("/shipment/step2");
	};

	return (
		<div>
			<NavigationBar />
			<div className="flex justify-center">
				<div className="flex flex-col justify-center w-[800px] h-full mt-20 border rounded-lg shadow-lg">
					<h1 className="text-2xl font-bold p-4 text-center">Shipment Form</h1>
					{/* <h2 className="text-xl font-semibold p-4">Sender Information</h2> */}
					<form className="flex flex-col p-4">

						<label onClick={() => setOpenCreateLocationDialog(true)} className="mb-2 font-semibold">Sender Address</label>
						{/* dropdown for saved addresses */}
						{/* tmp */}
						{/* create location dialog */}
						<CreateLocationDialog
							isOpen={openCreateLocationDialog}
							onClose={() => setOpenCreateLocationDialog(false)}
							userId={user?._id}
						/>
						{usedLocation && (
							<p className="mb-4 p-2 border rounded">
								{usedLocation.location_name}
								, {usedLocation.address_text}
							</p>
						)}

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
					<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded w-32 mx-auto mb-4" onClick={handleSubmit}>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
