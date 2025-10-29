"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [status, setStatus] = useState("loading...");

  // Call backend Express API
  useEffect(() => {
    axios
      .get("http://localhost:4826/api/health", { withCredentials: true })
      .then((res) => setStatus(res.data.status))
      .catch((err) => setStatus("error: " + err.message));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
        <h1 className="text-xl font-semibold text-white mb-4">
          DB Project Dashboard
        </h1>
        <p className="text-sm text-gray-300">
          Backend status:{" "}
          <span className="font-mono text-green-400">{status}</span>
        </p>

        <p className="text-xs text-gray-500 mt-4">
          This frontend is Next.js + Tailwind. Data is from MongoDB (via
          Express backend). Good for demo in database class.
        </p>
      </div>
    </main>
  );
}
