"use client"

import { redirect, useRouter } from "next/navigation"

export default function AdminTMPpage() {
    const router = useRouter()
    return (
        redirect("/admin/management/parcel/list")
    )
}