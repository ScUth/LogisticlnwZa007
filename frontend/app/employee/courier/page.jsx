"use client"

import { redirect } from "next/navigation"

export default function Courier() {
    return (
        redirect("/employee/courier/dashboard")
    )
}