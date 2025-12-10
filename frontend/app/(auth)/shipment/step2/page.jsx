"use client";

import { useState, useEffect } from "react";
import { NavigationBar } from "@/components/navbar";
import { useAuth } from "@/contexts/authContext";

export default function ShipmentPage() {

    const { user } = useAuth();
    console.log("Authenticated user:", user);
    console.log("User ID:", user ? user.first_name : "No user logged in");

    const [formData, setFormData] = useState({
        senderName: "",
        senderAddress: "",
        senderContact: "",
        receiverName: "",
        receiverAddress: "",
        receiverContact: "",
    });

    // set sender name when user data is available
    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                senderName: `${user.first_name} ${user.last_name}`,
                senderContact: `${user.phone}`,
            }));
        }
    }, [user]);
    
    return (
        <div>
            <NavigationBar />
            <div className="flex justify-center">
                <div className="flex flex-col justify-center w-[800px] h-full mt-20 border rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold p-4 text-center">Shipment Form</h1>
                    {/* <h2 className="text-xl font-semibold p-4">Sender Information</h2> */}
                    <form className="flex flex-col p-4">

                        <label className="mb-2 font-semibold">Sender Address</label>
                        {/* dropdown for saved addresses */}


                    </form>
                    Page-2
                    <div className="flex justify-between px-4">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded w-32 mx-auto mb-4 previous" onClick={() => history.back()}>
                            Previous
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded w-32 mx-auto mb-4">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
