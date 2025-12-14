"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentEmployee = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/employee/me`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setEmployee(data.employee);
            } else {
                console.warn('fetchCurrentEmployee failed:', response.status, await response.text());
                setEmployee(null);
            }
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            setEmployee(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentEmployee();
    }, []);

    const login = async (employee_id, password) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/employee/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employee_id, password }),
        });

        if (response.ok) {
            // set employee immediately from login response for better UX
            try {
                const data = await response.json();
                if (data?.employee) setEmployee(data.employee);
            } catch (e) {
                console.warn('Failed to parse login response JSON', e);
            }
            await fetchCurrentEmployee();
            return true;
        }
        return false;
    };

    const logout = async () => {
        await fetch(`${API_BASE_URL}/api/auth/employee/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setEmployee(null);
    };

    const register = async (first_name, last_name, phone, password, password_confirmation, role) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/employee/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ first_name, last_name, phone, password, password_confirmation, role }),
        });

        if (response.ok) {
            // for admin registering new employees, we do not auto-login
            return true;
        }
        return false;
    };

    return (
        <EmployeeAuthContext.Provider value={{ employee, loading, login, logout, register, refetchEmployee: fetchCurrentEmployee }}>
            {children}
        </EmployeeAuthContext.Provider>
    );
};

export const useEmployeeAuth = () => {
    const context = useContext(EmployeeAuthContext);
    if (!context) {
        throw new Error('useEmployeeAuth must be used within EmployeeAuthProvider');
    }
    return context;
};
