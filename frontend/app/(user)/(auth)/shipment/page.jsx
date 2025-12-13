"use client";

import { useState, useEffect, use } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useLocation } from "@/lib/use-location";
import { CreateLocationDialog } from "@/components/locations/create-location-dialog";
import { ListPickupLocationDialog } from "@/components/locations/list-pickup-location-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ShipmentCart } from "@/components/shipment/cart";
import { ShipmentForm } from "@/components/shipment/shipment-form";

export default function ShipmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [receiverFirstName, setReceiverFirstName] = useState("");
  const [receiverLastName, setReceiverLastName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverSubDistrict, setReceiverSubDistrict] = useState("");

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

  const [openCreateLocationDialog, setOpenCreateLocationDialog] =
    useState(false);
  const [openListLocationDialog, setOpenListLocationDialog] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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

  const sub_district_options = [
    "Lat Yao",
    "Sena Nikhom",
    "Chan Kasem",
    "Chom Phon",
    "Chatuchak",
  ];

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
      <div className="flex justify-center gap-4 mt-20 w-3/4 max-w-[1200px] mx-auto">
        <div className="space-y-4 flex-[2]">
          <div className="bg-white border rounded-lg shadow-md">
            <form className="flex flex-col p-4">
              <label className="mb-2 font-semibold">Sender Address</label>

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
                usedLocation={usedLocation}
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

              <div className="flex flex-row p-2 h-[100px] text-gray-400">
                {/* if no used location, show "No saved sender address found. Please create one." */}
                {/* else show html used location */}
                {usedLocation ? (
                  <div className="w-[calc(100%-72px)]">
                    <p className="font-semibold text-gray-800">
                      {usedLocation.location_name}
                    </p>
                    <p>{usedLocation.address_text}</p>
                    <p>
                      {usedLocation.sub_district}, Chatuchak, Bangkok, 10900
                    </p>
                  </div>
                ) : (
                  <p className="w-[calc(100%-72px)]">
                    No saved sender address found. Please create one.
                  </p>
                )}
                <button
                  onClick={handleSetPickupLocation}
                  className="w-[72px] items-center justify-center"
                >
                  <p className="text-gray-700 hover:underline">
                    {usedLocation ? "Change" : "Add"}
                  </p>
                </button>
              </div>
            </form>
          </div>
          <ShipmentForm/>
        </div>
        <div className="flex-1 ">
          <ShipmentCart />
        </div>
      </div>
    </div>
  );
}
