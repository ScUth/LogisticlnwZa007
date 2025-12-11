"use client";

import { useState, useEffect, use } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/use-location";
import { CreateLocationDialog } from "@/components/locations/create-location-dialog";
import { ListPickupLocationDialog } from "@/components/locations/list-pickup-location-dialog";

export default function ShipmentPage() {

	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [receiverName, setReceiverName] = useState("");
	const [receiverAddress, setReceiverAddress] = useState("");
	const [receiverContact, setReceiverContact] = useState("");

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
	const [openListLocationDialog, setOpenListLocationDialog] = useState(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login?redirect=/shipment");
		}
	}, [authLoading, user, router]);

	// Show loading state while auth is loading
	if (authLoading) {
		return (
			<div>
				<NavigationBar />
				<div className="flex justify-center items-center h-screen">
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render if no user (will redirect)
	if (!user) {
		return null;
	}

	// set sender name when user data is available
	const handleSubmit = (e) => {
		e.preventDefault();
		router.push("/shipment/step2");
	};

	const handleSetPickupLocation = async (e) => {
		e.preventDefault();
		if (!usedLocation) {
			setOpenCreateLocationDialog(true);
		} else {
			await fetchLocationsBySenderId();
			setOpenListLocationDialog(true);
		}
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
						
						<CreateLocationDialog
							isOpen={openCreateLocationDialog}
							onClose={() => setOpenCreateLocationDialog(false)}
							userId={user?._id}
							onCreate={createLocation}
							onSuccess={fetchSenderUsedLocation}
						/>

						<ListPickupLocationDialog
							userId={user?._id}
							isOpen={openListLocationDialog}
							onClose={() => setOpenListLocationDialog(false)}
							locations={locations}
							onSelect={async (location) => {
								await updateLocation(location._id, { used_for_pickup: true });
								await fetchSenderUsedLocation();
								setOpenListLocationDialog(false);
							}}
							openCreateLocationDialog={() => {
								setOpenListLocationDialog(false);
								setOpenCreateLocationDialog(true);
							}}
						/>


						<div className="flex flex-row mb-4 p-2 h-[100px] border-y border-gray-300 text-gray-400">
							{/* if no used location, show "No saved sender address found. Please create one." */}
							{/* else show html used location */}
							{usedLocation ? (
								<div className="w-[calc(100%-72px)]">
									<p className="font-semibold text-gray-800">{usedLocation.location_name}</p>
									<p>{usedLocation.address_text}</p>
								</div>
							) : (
								<p className="w-[calc(100%-72px)]">No saved sender address found. Please create one.</p>
							)}
							<button
								onClick={handleSetPickupLocation}
								className="w-[72px] items-center justify-center"
							>
								<p className="text-gray-700 hover:underline">{usedLocation ? "Change" : "Add"}</p>
							</button>
						</div>


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
