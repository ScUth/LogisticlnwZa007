"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:4826/api/health");
            if (res.ok) {
                const data = await res.json();
                setBackendStatus(Boolean(data.backend));
                setDbStatus(Boolean(data.database))
            }
        } catch (err) {
            console.error("Error fetching backend status:", err)
        }
    };
      fetchData();
  }, [backendStatus, dbStatus]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-xl ring-1 ring-gray-700">
        <h1 className="text-[50px] font-bold text-white mb-4">
          LogisticlnwZa007
        </h1>

        <div className="space-y-2 text-sm text-gray-300">
          <p className="text-[20px] font-bold">
            Backend status:{" "}
            <span className={`font-mono ${
                backendStatus ? "text-green-400" : "text-red-400"
                }`}>
                    {backendStatus ? "✅Online" : "❌Offline"}
            </span>
          </p>
          <p className="text-[20px] font-bold">
            Database status:{" "}
            <span
              className={`font-mono ${
                dbStatus ? "text-green-400" : "text-red-400"
              }`}
            >
              {dbStatus ? "✅Connected" : "❌Disconnected"}
            </span>
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          API → Express → Mongoose → MongoDB.
        </p>
      </div>
    </main>
  );
}
