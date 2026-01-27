import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'arak_auth_token';
const USER_KEY = 'arak_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token, rememberMe = false) => {
        setUser(userData);

        if (rememberMe) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    };

    const getToken = () => {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    };

    const isAuthenticated = () => {
        return !!user && !!getToken();
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Super Admin Bypass
        if (user.role === 'Super Admin') return true;

        return allowedRoles.includes(user.role);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        getToken,
        isAuthenticated,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
