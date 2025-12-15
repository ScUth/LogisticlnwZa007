"use client";

import React, { useEffect, useState } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/context/authContext";

	const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826";

export default function ShipmentRequestsPage() {
	const { user, loading: authLoading } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requests, setRequests] = useState([]);

	useEffect(() => {
		if (!user || authLoading) return;

		const fetchRequests = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${API_BASE_URL}/api/pickup-requests`, {
					credentials: "include",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Failed to load pickup requests");
				}
				setRequests(data.requests || []);
			} catch (err) {
				setError(err.message || "Error loading pickup requests");
			} finally {
				setLoading(false);
			}
		};

		fetchRequests();
	}, [user, authLoading]);

	return (
		<div>
			<NavigationBar />
			<div className="max-w-3xl mx-auto mt-10 mb-20 px-4">
				<h1 className="text-2xl font-semibold mb-4 text-gray-800">
					Pickup Request History
				</h1>

				{authLoading ? (
					<p className="text-gray-500">Checking authentication...</p>
				) : !user ? (
					<p className="text-gray-500">Please log in to view your requests.</p>
				) : loading ? (
					<p className="text-gray-400">Loading requests...</p>
				) : error ? (
					<p className="text-red-500 text-sm">{error}</p>
				) : requests.length === 0 ? (
					<p className="text-gray-500 text-sm">
						You have no pickup requests yet.
					</p>
				) : (
					<div className="space-y-6">
						{requests.map(({ request, items }) => (
							<div
								key={request._id}
								className="border rounded-lg bg-white shadow-sm overflow-hidden"
							>
								<div className="px-4 py-3 border-b bg-amber-300 flex justify-between items-center">
									<div>
										<div className="text-sm font-semibold text-gray-800">
											Request Code: {request.request_code || request._id}
										</div>
										<div className="text-xs text-gray-500">
											Status: <span className="uppercase">{request.status}</span>
										</div>
									</div>
									{request.requested_at && (
										<div className="text-xs text-gray-500 text-right">
											{new Date(request.requested_at).toLocaleString()}
										</div>
									)}
								</div>
								<div className="px-4 py-3 space-y-2">
									{items.length === 0 ? (
										<p className="text-xs text-gray-500">
											No items for this request.
										</p>
									) : (
										items.map((item) => (
											<div
												key={item._id}
												className="border rounded-md px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
											>
												<div>
													<div className="text-sm font-medium text-gray-800">
														{item.recipient.first_name} {item.recipient.last_name}
													</div>
													<div className="text-xs text-gray-500 truncate max-w-[260px]">
														{item.recipient.address_text}
													</div>
													<div className="text-xs text-gray-400">
														{item.recipient.sub_district}
													</div>
												</div>
												<div className="flex flex-wrap gap-2 text-xs text-gray-700">
													<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
														Size: {item.size}
													</span>
													<span className="px-2 py-0.5 rounded-full bg-gray-100">
														Qty: {item.quantity}
													</span>
													<span className="px-2 py-0.5 rounded-full bg-gray-100">
														Est: {item.estimated_weight} g
													</span>
												</div>
											</div>
										))
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

