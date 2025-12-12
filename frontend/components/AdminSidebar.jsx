"use client"

import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import logo from "./img/whitelogo.png";
import { useContext, createContext, useState } from "react"
import Image from "next/image";
import { useAdminAuth } from "@/context/adminAuthContext";
import React from "react";
import { useRouter } from "next/navigation";

const SidebarContext = createContext()

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true)
    const {admin, loading, login, logout} = useAdminAuth();
    const [profileClick, setProfileClick] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout();
            setProfileClick(false)
            router.push("/admin/login")
        } catch (error) {
            console.error(error)
        }
    }

    const handleProfileClick = async () => {
        if (profileClick) {
            setProfileClick(false)
        }
        else {
            setProfileClick(true)
        }
    }
    
    return (
        <aside className="h-screen">
            <nav className={`h-full flex flex-col bg-amber-600 border-r shadow-sm transition-all duration-200 flex-shrink-0 ${expanded ? "w-80" : "w-16"}`}>
                <div className="p-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <Image
                            src={logo}
                            alt="logo"
                            width={expanded ? 140 : 40}
                            height={32}
                            className="object-contain"
                        />
                        {/* <span className={`text-white font-semibold text-lg transition-opacity duration-200 truncate max-w-[120px] ${expanded ? "opacity-100" : "opacity-0 translate-x-1"}`}>Logistic</span> */}
                    </div>
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                        title={expanded ? "Collapse" : "Expand"}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white z-20 flex-shrink-0 ml-2 border"
                    >
                        {expanded ? <ChevronFirst size={18} color="#334155" /> : <ChevronLast size={18} color="#334155" />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-2 py-2 space-y-1">{children}</ul>
                </SidebarContext.Provider>
                <button onClick={handleProfileClick} className="hover:bg-amber-700">
                    <div className="border-t flex p-3 items-center gap-3">
                        <div className="border-2 p-2 rounded-md font-medium text-red-700 border-red-700">
                            Admin
                        </div>
                        <div
                            className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
                        >
                            <div className="leading-4">
                                <h4 className="font-semibold text-white">{admin?.first_name} {admin?.last_name}</h4>
                                <span className="text-xs text-white/80">{admin?.employee_id}</span>
                            </div>
                        </div>
                    </div>
                </button>
                
                {profileClick && (
                    <button className="hover:bg-amber-700" onClick={handleLogout}>
                        <div className="border-t flex p-3 items-center gap-3">
                            <div
                                className={`
                    flex justify-between items-center
                    overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
                `}
                            >
                                <div className="font-bold text-white">
                                    Logout
                                </div>
                            </div>
                        </div>
                    </button>
                )}
            </nav>
        </aside>
    )
}

export function SidebarItem({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(SidebarContext)

    return (
        <li
            className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md transition-colors group text-white ${active ? "bg-amber-700 text-white cursor-default" : "hover:bg-amber-700 cursor-pointer"}`}
            onClick={!active && onClick ? onClick : undefined}
            aria-current={active ? "page" : undefined}
            aria-disabled={active ? true : undefined}
        >
            <span className="w-8 h-8 flex items-center justify-center text-white flex-shrink-0">{icon}</span>
            <span className={`ml-3 flex-1 transition-all duration-200 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-6px]'} whitespace-nowrap overflow-hidden`}>{text}</span>
            {alert && (
                <div
                    className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"
                        }`}
                />
            )}

            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-3 bg-indigo-100 text-indigo-800 text-sm shadow-sm invisible opacity-0 -translate-x-2 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    )
}

export function SubSidebarItem({ icon, text, active, onClick, level = 1 }) {
    const { expanded } = useContext(SidebarContext)
    const padding = expanded ? `${8 + (level - 1) * 12}px` : undefined

    return (
        <li
            className={`relative flex items-center py-1.5 px-3 my-1 text-sm rounded-md transition-colors group text-white ${active ? "bg-amber-700 text-white cursor-default" : "hover:bg-amber-700 cursor-pointer"}`}
            onClick={!active && onClick ? onClick : undefined}
            aria-current={active ? "page" : undefined}
            aria-disabled={active ? true : undefined}
            style={{ paddingLeft: padding }}
        >
            {icon && <span className="w-6 h-6 flex items-center justify-center text-white flex-shrink-0">{icon}</span>}
            <span className={`ml-3 flex-1 transition-all duration-200 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-6px]'} whitespace-nowrap overflow-hidden`}>{text}</span>

            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-3 bg-indigo-100 text-indigo-800 text-sm shadow-sm invisible opacity-0 -translate-x-2 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    )
}