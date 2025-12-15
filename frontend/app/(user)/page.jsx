"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationBar } from "@/components/navbar";
import TransportPicture from "@/components/img/transport.jpg";
import { Package, Truck, Shield, Clock, Search } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/authContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4826";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [backendStatus, setBackendStatus] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
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
  }, []);

  const handleShipmentClick = () => {
    if (!user) {
      router.push("/login?redirect=/shipment");
    } else {
      router.push("/shipment");
    }
  };

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      router.push(`/track?number=${trackingNumber}`);
    } else {
      router.push("/track");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationBar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Fast, Reliable & Secure
                <span className="block text-blue-600">Shipment Tracking</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Track your shipments in real-time with our advanced tracking system. 
                Get instant updates and complete visibility throughout the delivery journey.
              </p>
            </div>

            {/* Tracking Input */}
            <div className="space-y-4">
              <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your tracking number"
                  className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                />
                <button
                  onClick={handleTrack}
                  className="absolute right-1 top-1 bottom-1 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Track
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Enter up to 25 tracking numbers separated by commas
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${backendStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">Backend {backendStatus ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${dbStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">Database {dbStatus ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-xl opacity-20" />
              <Image
                src={TransportPicture}
                alt="Modern Transportation System"
                className="relative rounded-2xl shadow-2xl object-cover w-full h-[400px] lg:h-[500px]"
                priority
              />
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">2,500+</p>
                    <p className="text-sm text-gray-600">Active Shipments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Service
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
            <p className="text-gray-600">
              Get live updates on your shipment's location and estimated delivery time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Insured</h3>
            <p className="text-gray-600">
              Your shipments are fully insured and protected with advanced security measures.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Management</h3>
            <p className="text-gray-600">
              Create and manage shipments effortlessly with our intuitive dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Ship?</h2>
            <p className="text-blue-100 mb-8">
              Create a new shipment in just a few clicks. Get instant quotes and schedule pickups.
            </p>
            <button
              onClick={handleShipmentClick}
              className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 transition-colors"
            >
              <Package className="h-6 w-6" />
              Create New Shipment
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500 text-sm">
          Need help? Contact our support team at
          <span> </span>
          <a onClick={() => router.push("/contact")} className="cursor-pointer text-blue-500 hover:underline">here</a>
        </p>
      </div>
    </main>
  );
}