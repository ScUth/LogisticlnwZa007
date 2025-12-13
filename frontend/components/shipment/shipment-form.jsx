"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ShipmentForm() {
  const [formData, setFormData] = useState({
    recieverFirstName: "",
    recieverLastName: "",
    recieverContact: "",
    recieverAddressText: "",
    recieverSubDistrict: "",

    size: "",
    estimatedWeight: "",
    // number of items
    quantity: 1,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process formData here
    console.log("Form submitted:", formData);
  };

  const sub_district_options = [
    "Lat Yao",
    "Sena Nikhom",
    "Chan Kasem",
    "Chom Phon",
    "Chatuchak",
  ];

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-center text-2xl text-gray-700 font-bold mb-6">
          Shipment Form
        </h1>
        <h2 className="text-lg text-gray-600 mb-4">Receiver Information</h2>
        <div className="flex flex-row gap-4">
          <div className="flex flex-[2.5] flex-row gap-4 w-full">
            <div className="">
              <label className="mb-2 text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="recieverFirstName"
                value={formData.recieverFirstName}
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
                value={formData.recieverLastName}
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
              value={formData.recieverContact}
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
              value={formData.recieverAddressText}
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
                setFormData((prevData) => ({
                  ...prevData,
                  recieverSubDistrict: value,
                }))
              }
              value={formData.recieverSubDistrict}
            >
              <SelectTrigger className="w-full mt-[2px]">
                <SelectValue
                  placeholder="Select a sub district"
                />
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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
