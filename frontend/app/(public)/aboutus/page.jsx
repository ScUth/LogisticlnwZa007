"use client"
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { NavigationBar } from "@/components/navbar";
import SpongeBobPicture from "@/components/img/Caveman-SpongeBob.jpg";

export default function aboutUS() {
    return (
        <div>
            <NavigationBar/>
            <div className="w-screen mt-8 px-20 top-20 left-20">
                <div className="font-bold text-[60px] text-red-900">
                    About Us
                </div>

                <div className="text-[24px]">
                    Micro Logistic Company
                </div>

                <br /><br />
                <hr className="w-[100px] border-b-2  border-black"/>
                <br />

                <div className="text-[20px]">
                    Logisticslnwza007 is a 3-member group from 01219231 Database Systems for Software and Knowledge Engineers
                </div>

                <div className="text-[20px]">
                    course. The 3 members are Amornrit Sirikham, Chaiyapat Kumtho and Pasin Tongtip.
                </div>
            </div>

            <br /><br />

            <div className="flex w-full py-8 border-1 border-zinc-300 bg-zinc-300">
                <div className="w-2/3 px-20">
                    <div className="font-bold text-[36px]">
                        Our Features
                    </div>

                    <br />
                    <hr className="w-[100px] border-b-2  border-black"/>
                    <br />

                    <div className="text-[20px]">
                        Logisticslnwza007 is a micro logistic company that offers the users the most amazing jinger bell experience by having our driver pick up your parcel at your place and delivers them to your destination place :D 
                        We even make our driver carries weighing scale so you don't have to worry about the weight limit 💃. 
                        You can track your parcel through our tracking system na ja.
                        So please come join us by clicking the button below 🧚🏻.
                    </div>

                    <br />

                    <a href="/login" className="flex gap-2 h-[40px] w-[175px] items-center justify-center border-1 border-amber-600 bg-amber-600 text-white rounded-lg hover:border-amber-800 hover:bg-amber-800">
                        <span className="text-[20px]">Sign Up Now</span>
                        <ExternalLink />
                    </a>
                </div>

                <div className="flex w-1/3 items-center">
                    <Image 
                        src={SpongeBobPicture}
                        alt="Sample picture"
                        className="max-w-80 rounded-lg"
                    />
                </div>
            </div>
        </div>
    )
}
