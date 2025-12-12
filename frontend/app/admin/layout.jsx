"use client"

import React from 'react';
import { AdminAuthProvider } from '@/context/adminAuthContext';

export default function AdminLayout({ children }) {
    return (
        <AdminAuthProvider>
            {children}
        </AdminAuthProvider>
    );
}
