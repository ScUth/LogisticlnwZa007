import express from "express";
import { Location } from "../models/location.js";

// Function to create a new location
export const createLocation = async (req, res) => {
	try {
		const { location_name, address_text, region_code, sender, used_for_pickup } = req.body;
		const newLocation = new Location({
			location_name,
			address_text,
			region_code,
			sender,
			used_for_pickup
		});

		await newLocation.save();
		res.status(201).json({ message: "Location created successfully", location: newLocation });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Function to get all locations for a specific sender
export const getLocationsBySender = async (req, res) => {
	try {
		const { senderId } = req.params;
		const locations = await Location.find({ sender: senderId });
		if (!locations || locations.length === 0) {
			return res.status(404).json({ message: "No locations found for this sender" });
		}

		res.status(200).json({ locations });
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
		const updates = req.body;
		const location = await Location.findByIdAndUpdate(locationId, updates, { new: true });
		if (!location) {
			return res.status(404).json({ message: "Location not found" });
		}
		res.status(200).json({ message: "Location updated successfully", location });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};