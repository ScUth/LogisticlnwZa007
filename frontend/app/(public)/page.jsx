"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { NavigationBar } from "@/components/navbar";
import TransportPicture from "@/components/img/transport.jpg";
import { Package } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/authContext"; 

export default function HomePage() {
  const router = useRouter();

  const { user } = useAuth();

  const [backendStatus, setBackendStatus] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4826/api/health");
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(Boolean(data.backend));
          setDbStatus(Boolean(data.database));
        }
      } catch (err) {
        console.error("Error fetching backend status:", err);
      }
    };
    fetchData();
  }, [backendStatus, dbStatus]);

  const handleShipmentClick = () => {
    if (!user) {
      router.push("/login?redirect=/shipment");
    } else {
      router.push("/shipment");
    }
  }

  return (
    <main>
      <NavigationBar />
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="flex w-full py-20 border-1 border-gray-300 rounded-lg mb-20 shadow-lg bg-white">
          <div className="w-1/3 flex items-center justify-center">
            <Image
              src={TransportPicture}
              alt="Transportation Picture"
              className="flex h-auto max-w-80 rounded-lg"
            />
          </div>
          <div className="w-2/3 flex flex-col justify-center">
            <div className="flex justify-center text-[40px] font-bold text-gray-800">
              Track Your Shipment
            </div>
            <div className="flex justify-center pt-10 relative">
              <input className="text-black border border-gray-500 w-1/2 h-10 rounded-l-lg pl-3" />
              <button
                className="text-white bg-brand hover:bg-brand-strong border border-gray-500 bg-blue-500 font-bold
                  focus:ring-4 focus:ring-brand-medium shadow-xs rounded-r-lg text-xs pl-3 px-3 right-1 hover:bg-blue-700"
              >
                Track
              </button>
            </div>
          </div>
        </div>
        <div
          onClick={handleShipmentClick}
          className="flex flex-row p-6 px-10 h-[120px] items-center gap-2 font-bold border-2 border-red-700 text-red-700 rounded-lg hover:bg-amber-600 hover:border-amber-600 hover:text-gray-100 transition"
        >
          <Package className="size-[50px]" />
          <span className="text-[22px]">Create Shipment</span>
        </div >
      </div>
    </main>
  );
}
