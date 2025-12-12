"use client"

import { useRouter } from "next/navigation";
import Image from "next/image";
import TransportationPicture from "@/components/img/transport_1.jpg";
import React, { useEffect } from "react";
import { useAdminAuth } from "@/context/adminAuthContext";


export default function AdminLogin() {
    const router = useRouter();

    const [AdminId, setAdminId] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const { admin, login } = useAdminAuth();

    // Redirect based on Admin role after login\

    const handleLogin = async () => {
        setError("");
        try {
            const success = await login(AdminId, password);
            if (!success) {
                setError("Failed to log in. Please check your credentials.");
            }
            // Redirect handled by useEffect above
        } catch (err) {
            setError("Failed to log in. Please check your credentials.", err);
        }
    };

    useEffect(() => {
        if (admin) {
            router.push('/admin');
        }
    }, [admin, router]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-stretch">
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
                <Image src={TransportationPicture} alt="Courier" className="w-[80%] h-auto rounded-md object-cover" />
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
                    {error && <div className="mb-4 text-red-600">{error}</div>}
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3">
                        <label className="block">
                            <span className="text-sm text-gray-600">Admin ID</span>
                            <input
                                type="text"
                                placeholder="Enter your Admin ID"
                                value={AdminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm text-gray-600">Password</span>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring"
                            />
                        </label>
                        <button
                            type="submit"
                            className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700"
                        >
                            Sign In
                        </button>
                    </form>
                    <div className="mt-4 text-sm text-gray-500">
                        <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
                    </div>
                </div>
            </div>
        </div>
    );
}