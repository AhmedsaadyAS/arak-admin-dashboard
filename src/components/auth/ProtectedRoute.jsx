import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Supports both role-based and permission-based access control
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Optional: Array of role names that can access this route
 * @param {string|string[]} props.requiredPermission - Optional: Permission(s) required to access this route
 */
export default function ProtectedRoute({ children, allowedRoles = null, requiredPermission = null }) {
    const { isAuthenticated, loading, hasRole, hasPermission, user } = useAuth();
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

    // 2. Check Access Control (Role-Based or Permission-Based)
    let allowed = true;

    // If permission is specified, check permission first
    if (requiredPermission) {
        allowed = hasPermission(requiredPermission);
    }
    // If roles are specified, check roles
    else if (allowedRoles) {
        allowed = hasRole(allowedRoles);
    }
    // Default: any authenticated user can access (specific permissions are on each route)
    // No additional restriction needed here

    if (!allowed) {
        console.warn(`Access Denied for user ${user?.email} (Role: ${user?.role}) to ${location.pathname}`);
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Render Content
    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    requiredPermission: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ])
};
