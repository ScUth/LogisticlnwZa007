"use client";
import { Banana, CircleX, CircleCheckBig } from "lucide-react";
import { NavigationBar } from "@/components/navbar";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function tracking() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams?.get("number");
        if (q) {
            setCode(q);
            fetchTrack(q);
        }
    }, [searchParams]);

    const fetchTrack = async (trackingCode) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/track/${trackingCode}`);
            if (!res.ok) {
                const text = await res.json().catch(() => ({}));
                throw new Error(text?.message || 'Parcel not found');
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavigationBar/>
            <div className="w-screen mt-8 px-20 top-20 left-20">
                <div className="font-bold text-[60px] text-red-900">Track & Trace</div>
            </div>

            <br /><br />

            <div className="flex flex-col w-full py-8 border-1 border-zinc-300 bg-zinc-300">
                <div className="flex items-center w-1/2 px-20">
                    <input value={code} onChange={(e) => setCode(e.target.value)} className="text-black border-1 border-gray-500 w-3/4 h-10 rounded-l-lg pl-3 shadow-lg" placeholder="Enter tracking number" />
                    <button onClick={() => fetchTrack(code)}
                        className="py-3 text-white bg-brand hover:bg-brand-strong border-1 border-gray-500 bg-blue-500 font-bold
                        focus:ring-4 focus:ring-brand-medium rounded-r-lg text-xs pl-3 px-3 right-1 hover:bg-blue-700 shadow-lg"
                    >
                        Track
                    </button>
                </div>

                <br />

                <div className=" w-2/3 px-20">
                    {loading && <div className="px-10 py-6 bg-white rounded shadow">Loading...</div>}
                    {error && <div className="px-10 py-6 bg-red-100 text-red-800 rounded shadow">{error}</div>}

                    {data && data.parcel && (
                        <>
                            <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                                <div className="font-bold text-[24px]">Shipment Details</div>
                                <br />
                                <div className="flex flex-row text-[14px]"><Banana className="text-yellow-500"/> Tracking code : {data.parcel.tracking_code}</div>
                                <br />
                                <div className="flex flex-row text-[14px]"><Banana className="text-yellow-500"/> Current status : {data.parcel.status}</div>
                                <br />
                                <div className="flex flex-row text-[14px]"><Banana className="text-yellow-500"/> Origin hub : {data.origin_hub?.hub_name || data.parcel.origin_hub_id || '-'}</div>
                                <div className="flex flex-row text-[14px]"><Banana className="text-yellow-500"/> Destination hub : {data.dest_hub?.hub_name || data.parcel.dest_hub_id || '-'}</div>
                                <div className="flex flex-row text-[14px]"><Banana className="text-yellow-500"/> SLA due : {data.parcel.sla_due_at ? new Date(data.parcel.sla_due_at).toLocaleString() : '-'}</div>
                                {data.proof && (
                                    <div className="mt-3 p-3 border rounded bg-green-50">
                                        <div className="font-semibold">Proof of Delivery</div>
                                        <div>Recipient: {data.proof.recipient_name}</div>
                                        <div>Signed at: {data.proof.signed_at ? new Date(data.proof.signed_at).toLocaleString() : '-'}</div>
                                    </div>
                                )}
                            </div>

                            <br />

                            <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                                <div className="font-bold text-[24px]">All Shipment Updates</div>
                                <br />
                                {data.events && data.events.length ? (
                                    data.events.map((e, i) => (
                                        <div key={i} className="flex flex-row items-center text-[14px] gap-2 py-2 border-b">
                                            {e.event_type === 'delivered' ? <CircleCheckBig className="text-green-600"/> : <CircleX className="text-red-600"/>}
                                            <div>
                                                <div className="font-semibold">{e.event_type.replace('_',' ')}</div>
                                                <div className="text-xs text-gray-600">{e.hub_id?.hub_name || ''} — {e.courier_id ? `${e.courier_id.first_name} ${e.courier_id.last_name} (${e.courier_id.employee_id})` : ''}</div>
                                                <div className="text-xs">{e.event_time ? new Date(e.event_time).toLocaleString() : ''}</div>
                                                {e.notes && <div className="text-xs text-gray-700">{e.notes}</div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-600">No events recorded yet.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
