"use client"

import { redirect, useRouter } from "next/navigation"
import { useEmployeeAuth } from "@/context/employeeAuthContext"

export default function AdminTMPpage() {
    const { employee } = useEmployeeAuth()
    if (!employee) {
        redirect("/employee/login")
    }
    const router = useRouter()
    return (
        redirect("/employee/courier")
    )
}