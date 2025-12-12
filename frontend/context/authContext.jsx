"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://kumtho.trueddns.com:33862/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const login = async (phone, password) => {
        const response = await fetch('http://kumtho.trueddns.com:33862/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ phone, password }),
        });

        if (response.ok) {
            await fetchCurrentUser();
            return true;
        }
        return false;
    };

    const logout = async () => {
        await fetch('http://kumtho.trueddns.com:33862/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    const register = async (first_name, last_name, phone, password, password_confirmation) => {
        const response = await fetch('http://kumtho.trueddns.com:33862/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ first_name, last_name, phone, password, password_confirmation }),
        });

        if (response.ok) {
            // log the user in after successful registration
            return await login(phone, password);
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, refetchUser: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};