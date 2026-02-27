import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { getPermissionsForRole, roleHasPermission, PERMISSIONS } from '../config/permissions';

const AuthContext = createContext(null);

const TOKEN_KEY = 'arak_auth_token';
const USER_KEY = 'arak_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    }, []);

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
    }, [logout]);

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

    /**
     * Check if user has a specific permission
     * @param {string|string[]} permission - Permission or array of permissions to check
     * @returns {boolean} - True if user has the permission(s)
     */
    const hasPermission = useCallback((permission) => {
        if (!user || !user.role) return false;

        // Super Admin has all permissions
        if (user.role === 'Super Admin') return true;

        // If array, check if user has at least one of the permissions
        if (Array.isArray(permission)) {
            return permission.some(p => roleHasPermission(user.role, p));
        }

        return roleHasPermission(user.role, permission);
    }, [user]);

    /**
     * Get all permissions for the current user's role
     */
    const userPermissions = useMemo(() => {
        if (!user || !user.role) return [];
        return getPermissionsForRole(user.role);
    }, [user]);

    const value = {
        user,
        loading,
        login,
        logout,
        getToken,
        isAuthenticated,
        hasRole,
        hasPermission,
        userPermissions,
        PERMISSIONS  // Export permission constants for components
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
