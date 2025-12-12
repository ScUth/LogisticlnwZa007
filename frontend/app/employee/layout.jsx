"use client"

import { EmployeeAuthProvider } from "@/context/employeeAuthContext";

export default function EmployeeLayout({ children }) {
  return (
    <EmployeeAuthProvider>
      {children}
    </EmployeeAuthProvider>
  );
}