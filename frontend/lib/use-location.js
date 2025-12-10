"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export function useLocation(senderId) {
  const [locations, setLocations] = useState([]);
  const [usedLocation, setUsedLocation] = useState(null);
  const [locBySenderMessage, setLocBySenderMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // get locations by sender ID
  const fetchLocationsBySenderId = useCallback(
    async (id = senderId) => {
      if (!id) return;

      setLoading(true);
      setError(null);
      setLocBySenderMessage("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/locations/sender/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setLocations([]);
            setUsedLocation(null);
            setLocBySenderMessage("You have no location data.");
            return;
          } else {
            throw new Error(`Error fetching locations: ${response.statusText}`);
          }
        }

        const data = await response.json();
        setLocations(data.locations || []);
      } catch (err) {
        setError(err.message || "Error fetching locations");
      } finally {
        setLoading(false);
      }
    },
    [senderId]
  );

  // get sender used location
  const fetchSenderUsedLocation = useCallback(
    async (id = senderId) => {
      if (!id) return null;
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/locations/sender/${id}/used`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(
            `Error fetching used location: ${response.statusText}`
          );
        }
        const data = await response.json();
        setUsedLocation(data.location || null);
        return data.location || null;
      } catch (err) {
        setError(err.message || "Error fetching used location");
        return null;
      }
    },
    [senderId]
  );

  // post create location
  const createLocation = useCallback(
    async ({ location_name, address_text, region_code, used_for_pickup }) => {
      if (!location_name?.trim() || !address_text?.trim() || !senderId) {
        const err = new Error("Location name, address, and sender are required");
        setError(err.message);
        throw err;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            location_name: location_name.trim(),
            address_text: address_text.trim(),
            region_code: region_code || "",
            sender: senderId, // always trust current user
            used_for_pickup: !!used_for_pickup,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `Error creating location: ${response.statusText}`
          );
        }

        // Backend may have changed used_for_pickup on other locations,
        // so just refresh from server to keep it correct + sorted.
        await fetchLocationsBySenderId(senderId);
        if (used_for_pickup) {
          await fetchSenderUsedLocation(senderId);
        }

        return data.location; // in case caller wants it
      } catch (err) {
        setError(err.message || "Error creating location");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [senderId, fetchLocationsBySenderId, fetchSenderUsedLocation]
  );

  // patch update location
  const updateLocation = useCallback(
    async (locationId, updates) => {
      if (!locationId) {
        throw new Error("Location ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/locations/${locationId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updates),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `Error updating location: ${response.statusText}`
          );
        }

        // Refresh locations from server to get updated state
        // (especially important if used_for_pickup changed)
        await fetchLocationsBySenderId(senderId);
        if (updates.used_for_pickup) {
          await fetchSenderUsedLocation(senderId);
        }

        return data.location;
      } catch (err) {
        setError(err.message || "Error updating location");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [senderId, fetchLocationsBySenderId, fetchSenderUsedLocation]
  );

  // auto fetch when senderId changes
  useEffect(() => {
    if (senderId) {
      fetchLocationsBySenderId();
      fetchSenderUsedLocation();
    }
  }, [senderId, fetchLocationsBySenderId, fetchSenderUsedLocation]);

  return {
    locations,
    loading,
    error,
    locBySenderMessage,
    fetchLocationsBySenderId,
    createLocation,
    updateLocation,
    usedLocation,
    fetchSenderUsedLocation,
  };
}
