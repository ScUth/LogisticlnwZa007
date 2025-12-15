"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { useRouter } from "next/navigation"
import { Play, CheckSquare, MapPin, Package, Truck } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useEmployeeAuth } from "@/context/employeeAuthContext"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862"

export default function Courier() {
  const router = useRouter()
  const { employee } = useEmployeeAuth()

  const [routeStarted, setRouteStarted] = useState(false)
  const [parcelsCount, setParcelsCount] = useState(0)
  const [deliveries, setDeliveries] = useState([])
  const [todaysRoute, setTodaysRoute] = useState(null)
  const [openRoutes, setOpenRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [acceptedLoading, setAcceptedLoading] = useState(false)
  const [acceptedError, setAcceptedError] = useState(null)

    useEffect(() => {
        if (!employee) {
            router.push("/employee/login")
        }
    }, [employee, router])

    const fetchDashboard = async () => {
        if (!employee) return
        setLoading(true)
        setError(null)
        try {
            // today's route and parcels
            const r1 = await fetch(
                `${API_BASE_URL}/api/employee/route/today`,
                { credentials: "include" }
            )
            const routeData = r1.ok ? await r1.json() : null
            if (routeData?.data?.route) {
                setTodaysRoute(routeData.data.route)
                setDeliveries(routeData.data.parcels || [])
                setRouteStarted(routeData.data.route.status === "out_for_delivery")
            } else {
                setTodaysRoute(null)
                setDeliveries([])
            }

            // count parcels assigned
            const r3 = await fetch(
                `${API_BASE_URL}/api/employee/parcels`,
                { credentials: "include" }
            )
            const parcelsData = r3.ok ? await r3.json() : null
            setParcelsCount(parcelsData?.data?.stats?.total || 0)

            // open routes
            const r4 = await fetch(
                `${API_BASE_URL}/api/employee/routes/open`,
                { credentials: "include" }
            )
            const openData = r4.ok ? await r4.json() : null
            setOpenRoutes(openData?.data?.routes || [])
        } catch (err) {
            console.error(err)
            setError("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (employee) fetchDashboard()
    }, [employee])

    useEffect(() => {
        const fetchAcceptedRequests = async () => {
            if (!employee) return
            setAcceptedLoading(true)
            setAcceptedError(null)
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/courier/pickup-requests`,
                    { credentials: "include" }
                )
                const data = await res.json()

                if (!res.ok || data.success === false) {
                    throw new Error(
                        data.error || data.message || "Failed to load accepted requests"
                    )
                }

                const active = (data.data || []).filter((r) =>
                    ["assigned", "in_progress"].includes(r.status)
                )
                setAcceptedRequests(active)
            } catch (err) {
                setAcceptedError(err.message || "Error loading accepted requests")
            } finally {
                setAcceptedLoading(false)
            }
        }

        fetchAcceptedRequests()
    }, [employee])

    const startRoute = async () => {
        if (!todaysRoute) {
            alert("No route to start")
            return
        }
        if (!confirm("Start this route? This will mark all parcels as out for delivery.")) return
        
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/employee/routes/${todaysRoute._id}/start`,
                { method: "POST", credentials: "include" }
            )
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to start route")
            }
            await fetchDashboard()
            alert(`Route started! ${data.data?.updatedParcels || 0} parcels now out for delivery.`)
        } catch (err) {
            console.error(err)
            alert(err.message || "Failed to start route")
        }
    }

    const completeRoute = () => {
        setRouteStarted(false)
    }

    const acceptRoute = async (routeId) => {
        if (!confirm("Accept this route?")) return
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/employee/routes/${routeId}/accept`,
                { method: "POST", credentials: "include" }
            )
            if (!res.ok) throw new Error(await res.text())
            await fetchDashboard()
            alert("Route accepted")
        } catch (err) {
            console.error(err)
            alert("Failed to accept route")
        }
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<Play />} text="Dashboard" active/>
                <SidebarItem icon={<Package />} text="Parcel" onClick={() => router.push('/employee/courier/parcel')}/>
                <SidebarItem icon={<Package />} text="Parcels" onClick={() => router.push('/employee/courier/parcels')}/>
                <SidebarItem icon={<MapPin />} text="Route" onClick={() => router.push('/employee/courier/route')}/>
                <SidebarItem icon={<Truck />} text="Pickup" onClick={() => router.push('/employee/courier/pickup')}/>
            </Sidebar>
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Courier Dashboard</h1>
                        <p className="mt-1 text-gray-600">Good morning — Here's your summary for today</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Open routes available to accept */}
                    <section className="col-span-1 md:col-span-3 bg-white rounded-lg shadow p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Available Routes</h3>
                                <div className="text-sm text-gray-500">Routes without assigned courier</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            {loading && <div className="text-sm text-gray-500">Loading routes...</div>}
                            {!loading && openRoutes.length === 0 && <div className="text-sm text-gray-500">No open routes</div>}
                            <ul className="mt-3 space-y-2">
                                {openRoutes.map(r => (
                                    <li key={r._id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                            <div className="font-medium">{r.hub_id?.name || 'Unknown Hub'}</div>
                                            <div className="text-xs text-gray-500">{new Date(r.route_date).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <button onClick={() => acceptRoute(r._id)} className="px-3 py-1 rounded bg-amber-600 text-white">Accept</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                    {/* Route Card */}
                    <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-amber-600" />
                                <div>
                                    {todaysRoute ? (
                                        <>
                                            <h2 className="text-lg font-semibold">Route to {todaysRoute.hub_id?.name || 'Hub'}</h2>
                                            <div className="text-sm text-gray-500">Stops: {deliveries.length} • Date: {new Date(todaysRoute.route_date).toLocaleDateString()}</div>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-lg font-semibold">No route for today</h2>
                                            <div className="text-sm text-gray-500">You have no route scheduled for today</div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${routeStarted ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${routeStarted ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                    {routeStarted ? 'In progress' : 'Not started'}
                                </div>
                                <button disabled={routeStarted} onClick={startRoute} className={`px-3 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2`}> <Play size={16}/> Start Route</button>
                                <button disabled={!routeStarted} onClick={completeRoute} className={`px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2`}> <CheckSquare size={16}/> Complete Route</button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm text-gray-600">Progress</h3>
                            <div className="mt-2 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div style={{ width: `${routeStarted ? 40 : 0}%` }} className="bg-amber-600 h-full transition-all"></div>
                            </div>
                        </div>
                    </section>

                    {/* Stats & actions */}
                    <aside className="col-span-1 space-y-4">
                        <div onClick={() => router.push('/employee/courier/parcels')} role="button" tabIndex={0} className="bg-white rounded-lg shadow p-4 flex items-center gap-3 cursor-pointer hover:shadow-md">
                            <div className="bg-amber-100 p-2 rounded-md">
                                <Package className="text-amber-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Number of parcels</div>
                                <div className="text-xl font-semibold">{parcelsCount}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <h4 className="text-sm font-semibold">Route Details</h4>
                            <ul className="mt-2 text-sm text-gray-600 space-y-1">
                                <li>Driver: {employee ? `${employee.first_name} ${employee.last_name}` : '—'}</li>
                                <li>Vehicle: V-124</li>
                                <li>Stops: {deliveries.length}</li>
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* Pickup and Delivery sections */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-amber-50">
                                                        <Package className="text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">Accepted pickup requests</h3>
                                                        <div className="text-sm text-gray-500">
                                                            Requests you've already accepted from senders
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Active: {acceptedRequests.length}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                {acceptedLoading ? (
                                                    <div className="text-sm text-gray-400">
                                                        Loading accepted requests...
                                                    </div>
                                                ) : acceptedError ? (
                                                    <div className="text-sm text-red-500">
                                                        {acceptedError}
                                                    </div>
                                                ) : acceptedRequests.length === 0 ? (
                                                    <div className="text-sm text-gray-500">
                                                        You have no accepted pickup requests yet.
                                                    </div>
                                                ) : (
                                                    <ul className="space-y-2">
                                                        {acceptedRequests.slice(0, 4).map((r) => (
                                                            <li
                                                                key={r._id}
                                                                className="flex items-center justify-between p-2 border rounded"
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-sm">
                                                                        {r.request_code || r._id}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {r.requester?.first_name}{" "}
                                                                        {r.requester?.last_name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 truncate max-w-[220px]">
                                                                        {r.pickup_location?.address_text}
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded-full ${
                                                                        r.status === "assigned"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : "bg-green-100 text-green-800"
                                                                    }`}
                                                                >
                                                                    {r.status === "assigned"
                                                                        ? "Assigned"
                                                                        : "In progress"}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-amber-50">
                                    <Truck className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Deliveries (tmp)</h3>
                                    <div className="text-sm text-gray-500">Parcels to deliver to recipients</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">Pending: {deliveries.filter(d => d.status === 'Pending').length}</div>
                        </div>

                        <ul className="mt-4 space-y-2">
                            {deliveries.slice(0, 4).map(d => (
                                <li key={d._id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <div className="font-medium">{d.tracking_code} — {d.recipient?.first_name} {d.recipient?.last_name}</div>
                                        <div className="text-xs text-gray-500">{d.recipient?.address_text}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'at_dest_hub' || d.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' : d.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{d.status}</span>
                                        <button onClick={() => router.push('/employee/courier/parcel')} className="text-sm px-2 py-1 rounded bg-green-600 text-white">Open</button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 text-right">
                            <button onClick={() => router.push('/employee/courier/deliveries')} className="text-sm text-blue-600 hover:underline">View All</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}