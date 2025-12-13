"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentAdmin = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/admin/me`, {
                credentials: 'include',
            });
            // console.log('Fetch current admin response:', response);
            if (response.ok) {
                const data = await response.json();
                if (data.admin) {
                    setAdmin(data.admin);
                } else {
                    setAdmin(null);
                }
            } else {
                setAdmin(null);
            }
        } catch (error) {
            console.error('Failed to fetch admin:', error);
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentAdmin();
    }, []);

    const login = async (employee_id, password) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employee_id, password }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.admin) {
                // update local admin state
                setAdmin(data.admin);
                return true;
            }
            // if not admin, clear any employee cookies
            await logout();
        }
        return false;
    };

    const logout = async () => {
        await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout, refetchAdmin: fetchCurrentAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};
