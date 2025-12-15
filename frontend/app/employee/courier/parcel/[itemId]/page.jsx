"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar, { SidebarItem } from "@/components/driversidebar";
import { Play, MapPin, Package, Truck } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";

  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(
      `Server did not return JSON for ${url}. Response starts with: ${text.slice(
        0,
        80
      )}`
    );
  }

  return { res, data };
}

export default function CourierParcelCreatePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.itemId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [subDistrictOptions] = useState([
    "Lat Yao",
    "Sena Nikhom",
    "Chan Kasem",
    "Chom Phon",
    "Chatuchak",
  ]);

  useEffect(() => {
    if (!itemId) return;

    const loadItem = async () => {
      setLoading(true);
      setError(null);
      try {
        // Reuse courier parcels endpoint to find the pickup item by id
        const { res, data } = await fetchJson(
          `${API_BASE_URL}/api/courier/parcels`,
          { credentials: "include" }
        );

        if (!res.ok || data.success === false) {
          throw new Error(data.error || data.message || "Failed to load courier parcels");
        }

        const grouped = data.data?.groupedParcels || {};
        const forPickup = grouped.forPickup || [];
        const found = forPickup.find(
          (p) => p._id === itemId || p.pickup_request_item === itemId
        );

        if (!found) {
          throw new Error("Pickup item not found or no longer pending for pickup");
        }

        setItem(found);

        const quantity = Number(found.quantity || 1);
        const defaultSize = found.size || "small";
        const defaultWeight = found.estimated_weight || "";
        const recipient = found.recipient || {};

        setParcels(
          Array.from({ length: quantity }, () => ({
            weight_grams: defaultWeight,
            size: defaultSize,
            recipient_first_name: recipient.first_name || "",
            recipient_last_name: recipient.last_name || "",
            recipient_phone: recipient.phone || "",
            recipient_address_text: recipient.address_text || "",
            recipient_sub_district: recipient.sub_district || "",
          }))
        );
      } catch (err) {
        console.error("[CourierParcelCreatePage] loadItem error", err);
        setError(err.message || "Error loading pickup item");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const handleChangeParcel = (index, field, value) => {
    setParcels((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || parcels.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        parcels: parcels.map((p) => ({
          weight_grams: Number(p.weight_grams),
          size: p.size,
          recipient: {
            first_name: p.recipient_first_name,
            last_name: p.recipient_last_name,
            phone: p.recipient_phone,
            address_text: p.recipient_address_text,
            sub_district: p.recipient_sub_district,
          },
        })),
      };

      const { res, data } = await fetchJson(
        `${API_BASE_URL}/api/courier/pickup-items/${itemId}/confirm-parcels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || "Failed to confirm parcels");
      }

      // On success, go back to pickup dashboard
      router.push("/employee/courier/pickup");
    } catch (err) {
      console.error("[CourierParcelCreatePage] submit error", err);
      setError(err.message || "Error confirming parcels");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarItem
          icon={<Play />}
          text="Dashboard"
          onClick={() => router.push("/employee/courier/dashboard")}
        />
        <SidebarItem
          icon={<Package />}
          text="Parcel"
          active
          onClick={() => router.push("/employee/courier/parcel")}
        />
        <SidebarItem
          icon={<Package />}
          text="Parcels"
          onClick={() => router.push("/employee/courier/parcels")}
        />
        <SidebarItem
          icon={<MapPin />}
          text="Route"
          onClick={() => router.push("/employee/courier/route")}
        />
        <SidebarItem
          icon={<Truck />}
          text="Pickup"
          onClick={() => router.push("/employee/courier/pickup")}
        />
      </Sidebar>

      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Create Parcels</h1>
          <p className="text-sm text-gray-600 mb-4">
            Confirm item details and create one parcel per quantity.
          </p>

          {loading && <div className="text-gray-500">Loading pickup item...</div>}
          {error && !loading && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          {!loading && item && (
            <>
              <div className="mb-6 p-4 bg-white rounded-lg shadow border">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Pickup Item
                </div>
                <div className="text-sm text-gray-800 font-medium">
                  {item.recipient?.first_name} {item.recipient?.last_name}
                </div>
                <div className="text-xs text-gray-600">
                  {item.recipient?.address_text}
                </div>
                <div className="text-xs text-gray-500">
                  {item.recipient?.sub_district}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                    Size: <span className="font-semibold">{item.size}</span>
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100">
                    Qty: <span className="font-semibold">{item.quantity}</span>
                  </span>
                  {item.estimated_weight != null && (
                    <span className="px-2 py-1 rounded-full bg-gray-100">
                      Est. weight: {item.estimated_weight} g
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white rounded-lg shadow border p-4">
                  <div className="text-sm font-semibold mb-3">
                    Parcels to create ({parcels.length})
                  </div>
                  <div className="space-y-4">
                    {parcels.map((p, idx) => (
                      <div
                        key={idx}
                        className="border-b pb-4 last:border-b-0 last:pb-0 space-y-3"
                      >
                        <div className="text-xs font-semibold text-gray-500">
                          Parcel #{idx + 1}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Recipient first name
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={p.recipient_first_name}
                              onChange={(e) =>
                                handleChangeParcel(idx, "recipient_first_name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Recipient last name
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={p.recipient_last_name}
                              onChange={(e) =>
                                handleChangeParcel(idx, "recipient_last_name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Recipient phone
                            </label>
                            <input
                              type="tel"
                              required
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={p.recipient_phone}
                              onChange={(e) =>
                                handleChangeParcel(idx, "recipient_phone", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Sub-district
                            </label>
                            <Select
                              value={p.recipient_sub_district}
                              onValueChange={(value) =>
                                handleChangeParcel(idx, "recipient_sub_district", value)
                              }
                            >
                              <SelectTrigger className="w-full border rounded px-2 py-1 text-sm">
                                <SelectValue placeholder="Select sub-district" />
                              </SelectTrigger>
                              <SelectContent>
                                {subDistrictOptions.map((district) => (
                                  <SelectItem key={district} value={district} className="px-8">
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              required
                              className="w-full border rounded px-2 py-1 text-sm min-h-[60px]"
                              value={p.recipient_address_text}
                              onChange={(e) =>
                                handleChangeParcel(idx, "recipient_address_text", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end gap-3 mt-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Weight (grams)
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={p.weight_grams}
                              onChange={(e) =>
                                handleChangeParcel(idx, "weight_grams", e.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-40">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Size
                            </label>
                            <select
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={p.size}
                              onChange={(e) =>
                                handleChangeParcel(idx, "size", e.target.value)
                              }
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md text-xs border border-red-300 text-red-700 bg-white hover:bg-red-50"
                            onClick={() => {
                              setParcels((prev) => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            Cancel this pickup
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => router.push("/employee/courier/pickup")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Confirm & Create Parcels"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
