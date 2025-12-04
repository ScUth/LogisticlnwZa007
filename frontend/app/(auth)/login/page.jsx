"use client"

import { NavigationBar } from "../../components/navbar"
import TransportationPicture from "../../components/img/transport_1.jpg"
import Image from "next/image"
import React, { use } from "react"

export default function Login() {
    const [isLogin, setIsLogin] = React.useState(false);
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

        try {
            const response = await fetch("http://localhost:4826/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    first_name,
                    last_name,
                    phone,
                    password,
                    password_confirmation
                }),
            });

            if (response.ok) {
                setIsLogin(true);
            }
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch("http://localhost:4826/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                credentials: "include",
                body: JSON.stringify({ phone: phoneLogin, password: passwordLogin }),
            });

            if (response.ok) {
                console.log("Login successful");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div>
            <NavigationBar />
            <div className="flex flex-col">
                <div className="flex w-full">
                    <div className="w-1/2 flex items-center justify-center h-screen">
                        <Image src={TransportationPicture} className="w-[60%] rounded-lg" />
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
                                <div>
                                    <input type="tel" placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" value={phoneLogin} onChange={(e) => setPhoneLogin(e.target.value)} />
                                    <input type="password" placeholder="Password" className="w-full mb-3 px-3 py-2 border rounded" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} />
                                    <button className="w-full bg-blue-600 text-white py-2 rounded mt-2" onClick={handleLoginSubmit}>
                                        Login
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input type="text" placeholder="Name" className="w-full mb-3 px-3 py-2 border rounded" value={first_name} onChange={(e) => setName(e.target.value)} />
                                    <input type="text" placeholder="last_name" className="w-full mb-3 px-3 py-2 border rounded" value={last_name} onChange={(e) => setLast_name(e.target.value)} />
                                    <input type="tel" placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    <input type="password" placeholder="Password" className="w-full mb-3 px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <input type="password" placeholder="Password Confirmation" className="w-full mb-3 px-3 py-2 border rounded" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}/>
                                    <button className="w-full bg-green-600 text-white py-2 rounded mt-2" onClick={handleRegisterSubmit}>
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}