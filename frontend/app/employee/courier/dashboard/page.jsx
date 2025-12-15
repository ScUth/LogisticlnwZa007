"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { useRouter } from "next/navigation"
import { Play, CheckSquare, MapPin, Package, Truck } from "lucide-react"
import React, { useEffect } from "react"
import { useEmployeeAuth } from "@/context/employeeAuthContext"

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862"

export default function Courier() {
    const router = useRouter()

    const { employee } = useEmployeeAuth()
    useEffect(() => {
        if (!employee) {
            router.push("/employee/login")
        }
    }, [employee, router])

        useEffect(() => {
            const fetchAcceptedRequests = async () => {
                if (!employee) return
                setAcceptedLoading(true)
                setAcceptedError(null)
                try {
                    const res = await fetch(`${API_BASE_URL}/api/courier/pickup-requests`, {
                        credentials: "include",
                    })
                    const data = await res.json()

                    if (!res.ok || data.success === false) {
                        throw new Error(data.error || data.message || "Failed to load accepted requests")
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

    const [routeStarted, setRouteStarted] = React.useState(false)
    const [parcelsCount, setParcelsCount] = React.useState(18)
    const [acceptedRequests, setAcceptedRequests] = React.useState([])
    const [acceptedLoading, setAcceptedLoading] = React.useState(false)
    const [acceptedError, setAcceptedError] = React.useState(null)
    const [deliveries, setDeliveries] = React.useState([
        { id: 'DL001', recipient: 'Bob', address: '456 Elm St', status: 'Pending' },
        { id: 'DL002', recipient: 'Maria', address: '9 Pine Rd', status: 'Pending' },
        { id: 'DL003', recipient: 'Sam', address: '2 Birch Ln', status: 'Delivered' },
    ])

    const todaysRoute = {
        id: 123,
        name: "Zone A - Morning Route",
        stops: 12,
        estimatedTimeMins: 90,
    }

    const startRoute = () => {
        setRouteStarted(true)
        // example: lock parcels to remaining count or adjust
        setParcelsCount((c) => c)
    }

    const completeRoute = () => {
        setRouteStarted(false)
        // example: mark some parcels delivered
        setParcelsCount((c) => Math.max(0, c - Math.floor(Math.random() * 5)))
    }

    const markDelivered = (id) => {
        setDeliveries((prev) => prev.map(d => d.id === id ? { ...d, status: 'Delivered' } : d))
        setParcelsCount((c) => Math.max(0, c - 1))
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
                    {/* Route Card */}
                    <section className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-amber-600" />
                                <div>
                                    <h2 className="text-lg font-semibold">{todaysRoute.name}</h2>
                                    <div className="text-sm text-gray-500">Stops: {todaysRoute.stops} • Est. time: {todaysRoute.estimatedTimeMins} mins</div>
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
                                <li>Driver: John Doe</li>
                                <li>Vehicle: V-124</li>
                                <li>Stops: {todaysRoute.stops}</li>
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
                                                                        <div className="text-sm text-gray-500">Requests you've already accepted from senders</div>
                                </div>
                            </div>
                                                        <div className="text-sm text-gray-600">
                                                                Active: {acceptedRequests.length}
                                                        </div>
                        </div>
                                                <div className="mt-4">
                                                        {acceptedLoading ? (
                                                            <div className="text-sm text-gray-400">Loading accepted requests...</div>
                                                        ) : acceptedError ? (
                                                            <div className="text-sm text-red-500">{acceptedError}</div>
                                                        ) : acceptedRequests.length === 0 ? (
                                                            <div className="text-sm text-gray-500">You have no accepted pickup requests yet.</div>
                                                        ) : (
                                                            <ul className="space-y-2">
                                                                {acceptedRequests.slice(0, 4).map((r) => (
                                                                    <li key={r._id} className="flex items-center justify-between p-2 border rounded">
                                                                        <div>
                                                                            <div className="font-medium text-sm">
                                                                                {r.request_code || r._id}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {r.requester?.first_name} {" "}
                                                                                {r.requester?.last_name}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 truncate max-w-[220px]">
                                                                                {r.pickup_location?.address_text}
                                                                            </div>
                                                                        </div>
                                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                                            r.status === 'assigned'
                                                                                ? 'bg-blue-100 text-blue-800'
                                                                                : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            {r.status === 'assigned' ? 'Assigned' : 'In progress'}
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
                                <li key={d.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <div className="font-medium">{d.id} — {d.recipient}</div>
                                        <div className="text-xs text-gray-500">{d.address}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{d.status}</span>
                                        <button onClick={() => markDelivered(d.id)} disabled={d.status !== 'Pending'} className="text-sm px-2 py-1 rounded bg-green-600 text-white disabled:bg-gray-200">Deliver</button>
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