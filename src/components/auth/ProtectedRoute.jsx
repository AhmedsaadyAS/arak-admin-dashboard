import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <LoadingSpinner />
            </div>
        );
    }

    // 1. Check Authentication
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Role (Role-Based Access Control)
    const { hasRole, user } = useAuth();

    // Default: Web Panel is strict "Admin" or "Super Admin" only area
    // If allowedRoles is passed, check specific roles. 
    // Otherwise, enforce default Admin Access.
    const allowed = allowedRoles
        ? hasRole(allowedRoles)
        : hasRole(['Admin', 'Super Admin']);

    if (!allowed) {
        console.warn(`Access Denied for user ${user?.username} (Role: ${user?.role})`);
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Render Content
    return children;
}
