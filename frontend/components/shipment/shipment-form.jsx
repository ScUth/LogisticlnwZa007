"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useShipment } from "@/context/shipmentContext";

export function ShipmentForm({ 
  setOpenShipmentForm, 
  onSubmitShipmentDraft, 
  shipmentDraftData, 
  setShipmentDraftData,
  isEditing,
}) {

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
  //   packageWeight: 0,
  //   packageSize: "",
  //   quantity: 1,
  // });

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    // check weight and quantity input
    console.log("Submitting shipment draft:", shipmentDraftData);
    await onSubmitShipmentDraft(e);
  }; 

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipmentDraftData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process shipmentDraftData here
    console.log("Form submitted:", shipmentDraftData);
  };

  const sub_district_options = [
    "Lat Yao",
    "Sena Nikhom",
    "Chan Kasem",
    "Chom Phon",
    "Chatuchak",
  ];

  // new packageSizes with descriptions
  const packageSizesWithDesc = [
    { size: "Small", desc: "< 14 x 20 x 6 cm" },
    { size: "Medium", desc: "< 40 x 45 x 26 cm" },
    { size: "Large", desc: "> 150 x 200 x 150 cm" },
  ];

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmitForm}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-center text-2xl text-gray-700 font-bold mb-6">
          Shipment Form
        </h1>
        <h2 className="text-lg font-bold text-gray-600 mb-4">
          Receiver Information
        </h2>
        <div className="flex flex-row gap-4">
          <div className="flex flex-[2.5] flex-row gap-4 w-full">
            <div className="">
              <label className="mb-2 text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="recieverFirstName"
                value={shipmentDraftData.recieverFirstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="mb-2 text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="recieverLastName"
                value={shipmentDraftData.recieverLastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex-[1]">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              name="recieverContact"
              value={shipmentDraftData.recieverContact}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 mb-6 items-start">
          <div className="flex-[2.5]">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="recieverAddressText"
              value={shipmentDraftData.recieverAddressText}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex-[1]">
            <label className="text-sm font-medium text-gray-700">
              Sub District
            </label>
            <Select
              onValueChange={(value) =>
                setShipmentDraftData((prevData) => ({
                  ...prevData,
                  recieverSubDistrict: value,
                }))
              }
              value={shipmentDraftData.recieverSubDistrict}
            >
              <SelectTrigger className="w-full mt-[2px]">
                <SelectValue placeholder="SELECT" />
              </SelectTrigger>
              <SelectContent>
                {sub_district_options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-600 mb-4">
          Package Information
        </h2>
        <div className="flex flex-col gap-4 mb-6">
          {/* First row: Small (full width) */}
          <div
            className={`w-full p-2 border rounded-md text-center cursor-pointer
              ${
                shipmentDraftData.size === "small"
                  ? "border-amber-500 bg-orange-100"
                  : "border-gray-300"
              }`}
            onClick={() =>
              setShipmentDraftData((prev) => ({
                ...prev,
                size: "small",
              }))
            }
          >
            <h3 className="text-md font-medium mb-2">Small</h3>
            <p className="text-sm text-gray-600">&lt; 14 x 20 x 6 cm</p>
          </div>
          
          {/* Second row: Medium and Large */}
          <div className="flex gap-4">
            <div
              className={`flex-1 p-2 border rounded-md text-center cursor-pointer
                ${
                  shipmentDraftData.size === "medium"
                    ? "border-amber-500 bg-orange-100"
                    : "border-gray-300"
                }`}
              onClick={() =>
                setShipmentDraftData((prev) => ({
                  ...prev,
                  size: "medium",
                }))
              }
            >
              <h3 className="text-md font-medium mb-2">Medium</h3>
              <p className="text-sm text-gray-600">&lt; 40 x 45 x 26 cm</p>
            </div>
            <div
              className={`flex-[1] p-2 border rounded-md text-center cursor-pointer
                ${
                  shipmentDraftData.size === "large"
                    ? "border-amber-500 bg-orange-100"
                    : "border-gray-300"
                }`}
              onClick={() =>
                setShipmentDraftData((prev) => ({
                  ...prev,
                  size: "large",
                }))
              }
            >
              <h3 className="text-md font-medium mb-2">Large</h3>
              <p className="text-sm text-gray-600">&gt; 150 x 200 x 150 cm</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-4 mb-6 justify-center">
          <div className="">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Estimated Weight (grams)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShipmentDraftData((prevData) => ({
                    ...prevData,
                    estimatedWeight: Math.max(
                      0,
                      (parseInt(prevData.estimatedWeight) || 0) - 100
                    ),
                  }))
                }
                className="w-[60px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                -100
              </button>
              <input
                type="number"
                name="estimatedWeight"
                value={shipmentDraftData.estimatedWeight}
                onChange={handleChange}
                className="flex-1 max-w-[108px] text-center p-2 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShipmentDraftData((prevData) => ({
                    ...prevData,
                    estimatedWeight:
                      (parseInt(prevData.estimatedWeight) || 0) + 100,
                  }))
                }
                className="w-[60px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                +100
              </button>
            </div>
          </div>
          <div className="">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() =>
                  setShipmentDraftData((prevData) => ({
                    ...prevData,
                    quantity: Math.max(
                      1,
                      (parseInt(prevData.quantity) || 1) - 1
                    ),
                  }))
                }
                className="size-[42px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                -1
              </button>
              <input
                type="number"
                name="quantity"
                value={shipmentDraftData.quantity}
                onChange={handleChange}
                className="flex-1 max-w-[64px] text-center p-2 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShipmentDraftData((prevData) => ({
                    ...prevData,
                    quantity: (parseInt(prevData.quantity) || 1) + 1,
                  }))
                }
                className="size-[42px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* create request, add to cart, or cancel */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setOpenShipmentForm(false)}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
          >
            {isEditing ? "Submit Edit" : "Create Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
}
