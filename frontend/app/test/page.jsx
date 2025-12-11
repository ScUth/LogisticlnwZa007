"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function TestPage() {

  const [backendStatus, setBackendStatus] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);
  const router = useRouter();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4826/api/health");
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(Boolean(data.backend));
          setDbStatus(Boolean(data.database));
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        console.error("Error fetching backend status:", err);
      }
    };
    fetchData();
  }, [backendStatus, dbStatus]);

  return (
    <div>
      <h1>System Health Check</h1>
      {loading ? <p className="text-amber-600">Loading...</p> : null}
      <p>Backend Status: {backendStatus ? "Online" : "Offline"}</p>
      <p>Database Status: {dbStatus ? "Online" : "Offline"}</p>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <button onClick={() => router.push("/")}>Go to Home</button>
    </div>
  );
}
