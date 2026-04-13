import axios from 'axios';

// Use the same base URL as api.js — VITE_API_BASE_URL already includes /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Real Login through our .NET API
 * POST /api/auth/login
 */
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });

        if (response.data && response.data.token) {
            return {
                success: true,
                data: {
                    user: response.data.user,
                    token: response.data.token
                }
            };
        }
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Invalid email or password');
    }

    throw new Error('Invalid email or password');
};

/**
 * Logout function calling backend
 * POST /api/auth/logout
 */
export const logout = async () => {
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (err) {
        console.warn('Logout API failed, ignoring client side', err);
    }
    return { success: true };
};

/**
 * Verify token via the backend /auth/me endpoint
 */
export const verifyToken = async (token) => {
    if (!token) return { valid: false };

    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && response.data.user) {
            return { valid: true };
        }
    } catch (error) {
        console.error("Token validation failed:", error);
    }
    return { valid: false };
};

/**
 * Get current user from token fetched from /auth/me endpoint
 */
export const getCurrentUser = async (token) => {
    if (!token) return { success: false };

    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && response.data.user) {
            return { success: true, data: response.data.user };
        }
    } catch (error) {
        console.error("Fetch current user failed:", error);
    }

    return { success: false };
};
