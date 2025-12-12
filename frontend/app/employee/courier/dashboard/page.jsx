"use client"

import Sidebar, { SidebarItem } from "@/components/driversidebar"
import { useRouter } from "next/navigation"
import { Play, CheckSquare, MapPin, Package } from "lucide-react"
import React from "react"

export default function Courier() {
    const router = useRouter()
    const [routeStarted, setRouteStarted] = React.useState(false)
    const [parcelsCount, setParcelsCount] = React.useState(18)

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

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar>
                <SidebarItem icon={<Play />} text="Dashboard" active/>
                <SidebarItem icon={<Package />} text="Parcel" onClick={() => router.push('/employee/courier/parcel')}/>
                <SidebarItem icon={<Package />} text="Parcels" onClick={() => router.push('/employee/courier/parcels')}/>
                <SidebarItem icon={<MapPin />} text="Route" onClick={() => router.push('/employee/courier/route')}/>
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
            </main>
        </div>
    )
}