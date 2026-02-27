import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Demo/fallback users - used when the API is unreachable or for quick demo logins
const DEMO_USERS = [
    {
        id: 1,
        email: 'admin@arak.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'Super Admin',
        avatar: 'AU'
    },
    {
        id: 2,
        email: 'teacher@arak.com',
        password: 'teacher123',
        name: 'Maria Historica',
        role: 'Teacher',
        avatar: 'MH'
    },
    {
        id: 3,
        email: 'parent@arak.com',
        password: 'parent123',
        name: 'John Parent',
        role: 'Parent',
        avatar: 'JP'
    },
    {
        id: 4,
        email: 'fees@arak.com',
        password: 'fees123',
        name: 'Finance Manager',
        role: 'Fees Admin',
        avatar: 'FM'
    },
    {
        id: 5,
        email: 'users@arak.com',
        password: 'users123',
        name: 'HR Manager',
        role: 'Users Admin',
        avatar: 'HR'
    },
    {
        id: 6,
        email: 'academic@arak.com',
        password: 'academic123',
        name: 'Academic Director',
        role: 'Academic Admin',
        avatar: 'AD'
    },
    {
        id: 7,
        email: 'schooladmin@arak.com',
        password: 'school123',
        name: 'School Admin',
        role: 'Admin',
        avatar: 'SA'
    }
];

/**
 * Login function - checks API first, then falls back to demo accounts
 * This allows users created via User Management to log in
 */
export const login = async (email, password) => {
    // 1. Try to find the user in the API (db.json)
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { email }
        });

        const apiUsers = response.data || [];
        // Find exact email match (JSON Server may return partial matches)
        const apiUser = apiUsers.find(u => u.email === email);

        if (apiUser && apiUser.password === password) {
            const token = `mock_jwt_token_${apiUser.id}_${Date.now()}`;
            const { password: _, ...userWithoutPassword } = apiUser;

            // Generate avatar initials from name
            if (!userWithoutPassword.avatar) {
                const nameParts = (userWithoutPassword.name || '').split(' ');
                userWithoutPassword.avatar = nameParts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2) || 'U';
            }

            return {
                success: true,
                data: {
                    user: userWithoutPassword,
                    token: token
                }
            };
        }
    } catch (err) {
        console.warn('API login check failed, falling back to demo accounts:', err.message);
    }

    // 2. Fallback: Check demo accounts (for quick demo logins)
    const demoUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
    );

    if (demoUser) {
        const token = `mock_jwt_token_${demoUser.id}_${Date.now()}`;
        const { password: _, ...userWithoutPassword } = demoUser;

        return {
            success: true,
            data: {
                user: userWithoutPassword,
                token: token
            }
        };
    }

    // 3. No match in API or demo accounts
    throw new Error('Invalid email or password');
};

/**
 * Mock logout function
 */
export const logout = async () => {
    return { success: true };
};

/**
 * Verify token validity
 */
export const verifyToken = async (token) => {
    if (token && token.startsWith('mock_jwt_token_')) {
        return { valid: true };
    }
    return { valid: false };
};

/**
 * Get current user from backend (with token)
 */
export const getCurrentUser = async (token) => {
    // Extract user ID from mock token
    const parts = token.split('_');
    const userId = parts[3];

    // Try API first
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        if (response.data) {
            const { password: _, ...userWithoutPassword } = response.data;
            return { success: true, data: userWithoutPassword };
        }
    } catch (err) {
        // Fallback to demo users
    }

    // Fallback to demo users
    const numericId = parseInt(userId);
    const user = DEMO_USERS.find(u => u.id === numericId);

    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, data: userWithoutPassword };
    }

    throw new Error('User not found');
};

