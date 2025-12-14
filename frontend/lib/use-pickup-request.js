"use client";

import { useState, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export function usePickupRequest() {
  const [draft, setDraft] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  // Get or create draft pickup request
  const getOrCreateDraft = useCallback(async (pickup_location) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-requests/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pickup_location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.statusText}`);
      }

      setDraft(data.draft);
      setItems(data.items || []);
      setCurrentRequestId(data.draft?._id);
      return data.draft;
    } catch (err) {
      setError(err.message || "Error getting draft");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get items for a pickup request
  const getItems = useCallback(async (requestId) => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pickup-requests/${requestId}/items`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error fetching items: ${response.statusText}`);
      }

      setItems(data.items || []);
      setCurrentRequestId(requestId);
      return data.items;
    } catch (err) {
      setError(err.message || "Error fetching items");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to pickup request
  const addItem = useCallback(async (requestId, itemData) => {
    if (!requestId) {
      throw new Error("Request ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pickup-requests/${requestId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(itemData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error adding item: ${response.statusText}`);
      }

      // Refresh items list
      await getItems(requestId);
      return data.newItem;
    } catch (err) {
      setError(err.message || "Error adding item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getItems]);

  // Update item
  const updateItem = useCallback(async (itemId, updates) => {
    if (!itemId) {
      throw new Error("Item ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pickup-request-items/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error updating item: ${response.statusText}`);
      }

      // Refetch items to ensure consistency with server
      if (currentRequestId) {
        await getItems(currentRequestId);
      }

      return data.item;
    } catch (err) {
      setError(err.message || "Error updating item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRequestId, getItems]);

  // Delete item
  const deleteItem = useCallback(async (itemId) => {
    if (!itemId) {
      throw new Error("Item ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pickup-request-items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error deleting item: ${response.statusText}`);
      }

      // Refetch items to ensure consistency with server
      if (currentRequestId) {
        await getItems(currentRequestId);
      }

      return true;
    } catch (err) {
      setError(err.message || "Error deleting item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRequestId, getItems]);

  // Submit pickup request
  const submitRequest = useCallback(async (requestId) => {
    if (!requestId) {
      throw new Error("Request ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pickup-requests/${requestId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error submitting request: ${response.statusText}`);
      }

      // Clear draft after successful submission
      setDraft(null);
      setItems([]);
      setCurrentRequestId(null);

      return data.pickupRequest;
    } catch (err) {
      setError(err.message || "Error submitting request");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    draft,
    items,
    loading,
    error,
    getOrCreateDraft,
    addItem,
    getItems,
    updateItem,
    deleteItem,
    submitRequest,
  };
}
