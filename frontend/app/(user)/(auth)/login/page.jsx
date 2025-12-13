"use client"

import { NavigationBar } from "@/components/navbar"
import TransportationPicture from "@/components/img/transport_1.jpg"
import Image from "next/image"
import React, { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/authContext"

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const { login, user, register, logout } = useAuth();

    const [isLogin, setIsLogin] = React.useState(true);
    const [first_name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [last_name, setLast_name] = React.useState("");
    const [phone, setPhone] = React.useState("");
    // const [next, setNext] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const [password_confirmation, setPasswordConfirmation] = React.useState("");
    const [phoneLogin, setPhoneLogin] = React.useState("");
    const [passwordLogin, setPasswordLogin] = React.useState("");

    const validateRegister = () => {
        let newErrors = {};

        if (!first_name.trim()) newErrors.first_name = "Name is required";
        if (!last_name.trim()) newErrors.last_name = "last_name is required";
        if (!phone.match(/^[0-9]{10}$/))
            newErrors.phone = "Phone must be 10 digits";
        if (password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;
        const success = await register(first_name, last_name, phone, password, password_confirmation);
        if (!success) {
            setErrors({ register: "Registration failed" });
        } else {
            // redirect to dashboard or home page
            router.push(redirect);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const success = await login(phoneLogin, passwordLogin);
        if (!success) {
            setErrors({ login: "Invalid phone or password" });
        } else {
            // redirect to dashboard or home page
            router.push(redirect);
        }
    };

    return (
        <div>
            <NavigationBar />
            <div className="flex flex-col">
                <div className="flex w-full">
                    <div className="w-1/2 flex items-center justify-center h-screen">
                        <Image src={TransportationPicture} 
                        alt="Transportation Picture"
                        className="w-[60%] rounded-lg" 
                    />
                    </div>

                    <div className="w-[1px] bg-gray-300 self-stretch"></div>

                    <div className="w-1/2 flex flex-col items-center justify-center">

                        {/* --- SWITCH BUTTON --- */}
                        <div className="flex bg-gray-200 rounded-full p-1 w-60 mb-6">
                            <button
                                className={`flex-1 py-2 rounded-full text-center font-semibold ${isLogin ? "bg-white shadow" : "text-gray-600"
                                    }`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`flex-1 py-2 rounded-full text-center font-semibold ${!isLogin ? "bg-white shadow" : "text-gray-600"
                                    }`}
                                onClick={() => setIsLogin(false)}
                            >
                                Register
                            </button>
                        </div>

                        {/* --- FIXED HEIGHT FORM CONTAINER --- */}
                        <div className="w-2/3 min-h-[350px] flex flex-col justify-start">

                            {isLogin ? (
                                <form onSubmit={handleLoginSubmit}>
                                    <input type="tel" placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" value={phoneLogin} onChange={(e) => setPhoneLogin(e.target.value)} />
                                    <input type="password" placeholder="Password" className="w-full mb-3 px-3 py-2 border rounded" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} />
                                    <button className="w-full bg-blue-600 text-white py-2 rounded mt-2" type="submit">
                                        Login
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegisterSubmit}>
                                    <input type="text" placeholder="Name" className="w-full mb-3 px-3 py-2 border rounded" value={first_name} onChange={(e) => setName(e.target.value)} />
                                    <input type="text" placeholder="last_name" className="w-full mb-3 px-3 py-2 border rounded" value={last_name} onChange={(e) => setLast_name(e.target.value)} />
                                    <input type="tel" placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    <input type="password" placeholder="Password" className="w-full mb-3 px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <input type="password" placeholder="Password Confirmation" className="w-full mb-3 px-3 py-2 border rounded" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}/>
                                    <button className="w-full bg-green-600 text-white py-2 rounded mt-2" type="submit">
                                        Register
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}