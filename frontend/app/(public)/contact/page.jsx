"use client"

import { NavigationBar } from "../../components/navbar"
import ContactIMG from "../../components/img/contactus.jpg"
import Image from "next/image"

export default function ContactUS() {
    return (
        <div>
            <NavigationBar/>
            <div className="w-full">
                <div className="relative">
                    <Image src={ContactIMG} className="w-screen max-h-[500px] object-cover brightness-50"/>
                    <div className="w-screen absolute text-center mt-20 top-20">
                        <h1 className="text-5xl font-bold text-white">
                            Contact Us
                        </h1>
                        <h2 className="mt-4 text-xl text-white">
                            You can contact us at the below addresses and email address.
                        </h2>
                    </div>
                    <div className="mt-20 flex w-screen">
                        <div className="flex w-1/2 items-center text-left flex-col">
                            <div>
                                <h1 className="text-2xl font-bold">Logisticslnwza007</h1>
                                <div className="pl-2">
                                    50 Ngamwongwan Rd, Lat Yao, Chatuchak, Bangkok 10900
                                </div>
                                <div className="pt-2"/>
                                <div className="font-bold">
                                    Email: 
                                </div>
                                <div className="flex flex-col">
                                    <a className="pl-2" type="email" href="mailto:chaiyapayt.k@ku.th"> chaiyapayt.k@ku.th</a>
                                    <a className="pl-2" type="email" href="mailto:amornrit.s@ku.th"> amornrit.s@ku.th</a>
                                    <a className="pl-2" type="email" href="mailto:pasin.to@ku.th"> pasin.to@ku.th</a>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-1/2">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.8510401506737!2d100.56969591141046!3d13.847978586497957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29d1e111be769%3A0x4332e8cd6aec8c31!2z4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4LmA4LiB4Lip4LiV4Lij4Lio4Liy4Liq4LiV4Lij4LmMIOC4p-C4tOC4l-C4ouC4suC5gOC4guC4leC4muC4suC4h-C5gOC4guC4mQ!5e0!3m2!1sth!2sth!4v1764839679008!5m2!1sth!2sth"
                                className="w-full" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}