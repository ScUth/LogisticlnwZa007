// user root layout + provider

import React from "react";
import { AuthProvider } from "@/context/authContext";

export default function UserLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
