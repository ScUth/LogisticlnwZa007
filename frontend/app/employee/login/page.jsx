"use client"

import { useRouter } from "next/navigation";
import Image from "next/image";
import TransportationPicture from "@/components/img/transport_1.jpg";
import React from "react";
import { useEmployeeAuth } from "@/context/employeeAuthContext";


export default function EmployeeLogin() {
    const router = useRouter();

    const { employee, register, login, logout } = useEmployeeAuth();

    const [employeeId, setEmployeeId] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    // Redirect based on employee role after login
    React.useEffect(() => {
        if (employee) {
            console.log("Logged in employee:", employee);
            switch (employee.role) {
                case "courier":
                    router.push("/employee/courier");
                    break;
                case "admin":
                    router.push("/employee/admin/dashboard");
                    break;
                case "manager":
                    router.push("/employee/manager");
                    break;
                case "staff":
                    router.push("/employee/staff");
                    break;
                default:
                    router.push("/employee/login");
            }
        }
    }, [employee, router]);

    const handleLogin = async () => {
        setError("");
        try {
            const success = await login(employeeId, password);
            if (!success) {
                setError("Failed to log in. Please check your credentials.");
            }
            // Redirect handled by useEffect above
        } catch (err) {
            setError("Failed to log in. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-stretch">
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
                <Image src={TransportationPicture} alt="Courier" className="w-[80%] h-auto rounded-md object-cover" />
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-semibold mb-4">Employee Login</h1>
                    {error && <div className="mb-4 text-red-600">{error}</div>}
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3">
                        <label className="block">
                            <span className="text-sm text-gray-600">Employee ID</span>
                            <input
                                type="text"
                                placeholder="Enter your employee ID"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
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