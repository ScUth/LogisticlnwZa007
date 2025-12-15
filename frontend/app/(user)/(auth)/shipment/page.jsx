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
import { useShipment } from "@/context/shipmentContext";
import { usePickupRequest } from "@/lib/use-pickup-request";

export default function ShipmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    locations,
    loading: locationLoading,
    error: locationError,
    locBySenderMessage,
    fetchLocationsBySenderId, // fetch locations function
    createLocation, // fetch create location function
    updateLocation, // fetch update location function
    usedLocation,
    fetchSenderUsedLocation, // fetch used location function
  } = useLocation(user?._id);

  const {
    draft, // request draft data
    items, // items belong to the request
    loading: pickupRequestLoading,
    error: pickupRequestError,
    getOrCreateDraft, // fetch get or create draft function
    addItem, // fetch add item to request function
    getItems, // fetch items belong to the request function
    updateItem, // fetch update item function
    deleteItem, // fetch delete item function
    submitRequest, // fetch submit pickup request function
  } = usePickupRequest();

  const {
    senderInfo,
    setSenderInfo,
    shipmentDrafts, // not used currently
    setShipmentDrafts,
    shipmentDraftData, // current shipment draft data
    setShipmentDraftData,
  } = useShipment();

  // default anatomy
  // const [senderInfo, setSenderInfo] = useState({
  //   senderFirstName: "",
  //   senderLastName: "",
  //   senderContact: "",
  //   senderAddressText: "",
  //   senderSubDistrict: "",
  // });
  // const [shipmentDraftData, setShipmentDraftData] = useState({
  //   recieverFirstName: "",
  //   recieverLastName: "",
  //   recieverContact: "",
  //   recieverAddressText: "",
  //   recieverSubDistrict: "",
  //   packageWeight: "",
  //   packageSize: "",
  //   quantity: 1,
  // });

  // update getOrCreateDraft when usedLocation changes
  useEffect(() => {
    if (usedLocation?.address_text && usedLocation?.sub_district) {
      getOrCreateDraft(usedLocation);
    }
  }, [usedLocation, getOrCreateDraft]);

  const handleEditItem = (item) => {
    // Populate form with item data
    setShipmentDraftData({
      recieverFirstName: item.recipient.first_name,
      recieverLastName: item.recipient.last_name,
      recieverContact: item.recipient.phone,
      recieverAddressText: item.recipient.address_text,
      recieverSubDistrict: item.recipient.sub_district,
      estimatedWeight: item.estimated_weight,
      size: item.size,
      quantity: item.quantity,
    });
    
    // Set editing state
    setIsEditing(true);
    setEditingItemId(item._id);
    
    // Open the form
    setOpenShipmentForm(true);
  };

  const handleSubmitShipmentDraft = async (e) => {
    e.preventDefault();
    
    if (!draft?._id) {
      console.error("No draft request found");
      return;
    }

    try {
      // Map shipmentDraftData to backend expected format
      const itemData = {
        recipient: {
          first_name: shipmentDraftData.recieverFirstName,
          last_name: shipmentDraftData.recieverLastName,
          phone: shipmentDraftData.recieverContact,
          address_text: shipmentDraftData.recieverAddressText,
          sub_district: shipmentDraftData.recieverSubDistrict,
        },
        estimated_weight: Number(shipmentDraftData.estimatedWeight),
        size: shipmentDraftData.size,
        quantity: Number(shipmentDraftData.quantity),
      };

      if (isEditing && editingItemId) {
        // Update existing item
        await updateItem(editingItemId, itemData);
      } else {
        // Add new item to the draft
        await addItem(draft._id, itemData);
      }
      
      // reset shipmentDraftData
      setShipmentDraftData({
        recieverFirstName: "",
        recieverLastName: "",
        recieverContact: "",
        recieverAddressText: "",
        recieverSubDistrict: "",
        estimatedWeight: "",
        size: "",
        quantity: 1,
      });
      
      // Reset editing state
      setIsEditing(false);
      setEditingItemId(null);
      
      // Close the form after successful submission
      setOpenShipmentForm(false);
    } catch (error) {
      console.error(isEditing ? "Error updating item:" : "Error adding item:", error);
      // Optionally show error to user
    }
  }

  const [openCreateLocationDialog, setOpenCreateLocationDialog] =
    useState(false);
  const [openListLocationDialog, setOpenListLocationDialog] = useState(false);
  const [openShipmentForm, setOpenShipmentForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

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
      <div className="flex justify-center gap-4 mt-10 mb-20 w-3/4 max-w-[1200px] mx-auto">
        <div className="space-y-4 flex-[2]">
          <div className="bg-white border rounded-lg shadow-md">
            <div className="flex flex-col px-4 py-2">
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

              <div className="flex flex-row p-2 text-gray-400">
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
            </div>
          </div>
          {openShipmentForm ? (
            <ShipmentForm 
              setOpenShipmentForm={setOpenShipmentForm}
              onSubmitShipmentDraft={handleSubmitShipmentDraft}
              shipmentDraftData={shipmentDraftData}
              setShipmentDraftData={setShipmentDraftData}
              isEditing={isEditing}
            />
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingItemId(null);
                  setOpenShipmentForm(true);
                }}
                className="w-full bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
              >
                Create Shipment
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 ">
          <ShipmentCart 
            usedLocation={usedLocation}
            onEditItem={handleEditItem}
            items={items}
            loading={pickupRequestLoading}
            error={pickupRequestError}
            deleteItem={deleteItem}
            submitRequest={submitRequest}
            draftId={draft?._id}
          />
        </div>
      </div>
    </div>
  );
}
