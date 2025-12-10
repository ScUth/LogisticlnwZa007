"use client";
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
                    <div className="w-full py-8 border-1 border-black bg-white rounded-lg shadow-lg">
                        <div className="px-10 text-[14px]">
                            Tracking code : 
                        </div>

                        <br />

                        <div className="px-10 text-[14px]">
                            This shipment is handled by : 
                        </div>
                    </div>

                    <br />

                    <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                        <div className="font-bold text-[24px]">
                            Shipment Details
                        </div>

                        <br />
                    </div>

                    <br />

                    <div className="w-full py-8 px-10 border-1 border-black bg-white rounded-lg shadow-lg">
                        <div className="font-bold text-[24px]">
                            All Shipment Updates
                        </div>

                        <br />
                    </div>
                </div>
            </div>
        </div>
    )
}
