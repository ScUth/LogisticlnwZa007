import express from "express";
import { Location } from "../models/location.js";
import { oid } from "../utils/validators.js";

// Function to create a new location
export const createLocation = async (req, res) => {
  try {
    const {
      location_name,
      address_text,
      sub_district,
      sender,
      used_for_pickup,
    } = req.body;

    if (!location_name?.trim() || !address_text?.trim() || !sender?.trim()) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const existingLocation = await Location.exists({ sender });

    // Normalize to boolean; adjust if you need custom parsing
    let usedForPickup = used_for_pickup === true;

    if (existingLocation) {
      if (usedForPickup) {
        await Location.updateMany(
          { sender },
          { $set: { used_for_pickup: false } }
        );
      }
    } else {
      // First location for this sender -> auto pickup
      usedForPickup = true;
    }

    const newLocation = new Location({
      location_name: location_name.trim(),
      address_text: address_text.trim(),
      sub_district,
      sender: sender.trim(),
      used_for_pickup: usedForPickup,
    });

    await newLocation.save();

    return res.status(201).json({
      message: "Location created successfully",
      location: newLocation,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A pickup location for this sender already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// Function to get all locations for a specific sender
export const getLocationsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    const locations = await Location.find({ sender: senderId }).sort({
      used_for_pickup: -1,
      updated_at: -1,
    });
    if (!locations || locations.length === 0) {
      return res
        .status(404)
        .json({ message: "No locations found for this sender" });
    }

    res.status(200).json({ locations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to get used location for a specific sender
export const getUsedLocationBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    const location = await Location.findOne({
      sender: senderId,
      used_for_pickup: true,
    });

    if (!location) {
      return res
        .status(404)
        .json({ message: "No used pickup location found for this sender" });
    }
    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to get a location by its ID
export const getLocationById = async (req, res) => {
  try {
    const { locationId } = req.params;
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to update a location by its ID (PATCH)
export const updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!oid(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }

    const { used_for_pickup, ...rest } = req.body;

    const allowedUpdates = ["location_name", "address_text", "sub_district"];
    const isValidOperation = Object.keys(rest).every((field) =>
      allowedUpdates.includes(field)
    );

    if (!isValidOperation && typeof used_for_pickup !== "boolean") {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    const locationToUpdate = await Location.findById(locationId);
    if (!locationToUpdate) {
      return res.status(404).json({ message: "Location not found" });
    }

    // If setting used_for_pickup = true, clear it from others of the same sender
    if (used_for_pickup === true) {
      await Location.updateMany(
        { sender: locationToUpdate.sender },
        { $set: { used_for_pickup: false } }
      );
    }

    const updates = { ...rest };
    if (typeof used_for_pickup === "boolean") {
      updates.used_for_pickup = used_for_pickup;
    }

    const location = await Location.findByIdAndUpdate(locationId, updates, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json({ message: "Location updated successfully", location });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Another pickup location already exists for this sender",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};
