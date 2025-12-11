"use client";
import { Banana, CircleX, CircleCheckBig } from "lucide-react";
import { NavigationBar } from "@/components/navbar";

export default function tracking() {
    return (
        <div>
            <NavigationBar/>
            <div className="w-screen mt-8 px-20 top-20 left-20">
                <div className="font-bold text-[60px] text-red-900">
                    Track & Trace
                </div>
            </div>

            <br /><br />

            <div className="flex flex-col w-full py-8 border-1 border-zinc-300 bg-zinc-300">
                <div className="flex items-center w-1/2 px-20">
                    <input className="text-black border-1 border-gray-500 w-3/4 h-10 rounded-l-lg pl-3 shadow-lg" />
                    <button
                        className="py-3 text-white bg-brand hover:bg-brand-strong border-1 border-gray-500 bg-blue-500 font-bold
                        focus:ring-4 focus:ring-brand-medium rounded-r-lg text-xs pl-3 px-3 right-1 hover:bg-blue-700 shadow-lg"
                    >
                        Track
                    </button>
                </div>
                
                <br />

                <div className=" w-2/3 px-20">
                    <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                        <div className="font-bold text-[24px]">
                            Shipment Details
                        </div>

                        <br />

                        <div className="flex flex-row text-[14px]">
                            <Banana className="text-yellow-500"/>
                            Tracking code : 20251200000
                        </div>

                        <br />

                        <div className="flex flex-row text-[14px]">
                            <Banana className="text-yellow-500"/>
                            This shipment is handled by : นายไก่ เกิดก่อนไข่
                        </div>
                    </div>

                    <br />

                    <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                        <div className="font-bold text-[24px]">
                            All Shipment Updates
                        </div>

                        <br />

                        <div className="flex flex-row items-center text-[14px] gap-2">
                            <CircleCheckBig className="text-green-600"/>
                            Shipment Confirmed @45:00:00 45 September 4545 BC
                        </div>
                        <div className="flex flex-row items-center text-[14px] gap-2">
                            <CircleX className="text-red-600"/>
                            Shipment Pick-up @23:00:00 47 September 4545 BC
                        </div>
                        <div className="flex flex-row items-center text-[14px] gap-2">
                            <CircleX className="font-bold text-red-600"/>
                            Shipment at Hub @12:40:00 52 September 4545 BC
                        </div>
                        <div className="flex flex-row items-center text-[14px] gap-2">
                            <CircleX className="font-bold text-red-600"/>
                            Shipment Delivering @55:24:00 55 September 4545 BC
                        </div>
                        <div className="flex flex-row items-center text-[14px] gap-2">
                            <CircleX className="font-bold text-red-600"/>
                            Shipment Delivered @70:00:00 55 September 4545 BC
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
