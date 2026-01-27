import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Mock user database (in production, this would be on the backend)
const MOCK_USERS = [
    {
        id: 1,
        email: 'admin@arak.com',
        password: 'admin123', // In production, never store plain passwords!
        name: 'Admin User',
        role: 'Admin',
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
    }
];

/**
 * Mock login function
 * In production, this would make a real API call to your backend
 */
export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            const user = MOCK_USERS.find(
                u => u.email === email && u.password === password
            );

            if (user) {
                // Create a mock JWT token
                const token = `mock_jwt_token_${user.id}_${Date.now()}`;

                // Return user data without password
                const { password: _, ...userWithoutPassword } = user;

                resolve({
                    success: true,
                    data: {
                        user: userWithoutPassword,
                        token: token
                    }
                });
            } else {
                reject({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }, 800); // 800ms delay to simulate network
    });
};

/**
 * Mock logout function
 */
export const logout = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 300);
    });
};

/**
 * Verify token validity
 * In production, this would validate the JWT token with the backend
 */
export const verifyToken = async (token) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock validation - in production, send token to backend
            if (token && token.startsWith('mock_jwt_token_')) {
                resolve({ valid: true });
            } else {
                resolve({ valid: false });
            }
        }, 200);
    });
};

/**
 * Get current user from backend (with token)
 * In production, this would fetch user data from backend using the token
 */
export const getCurrentUser = async (token) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Extract user ID from mock token
            const parts = token.split('_');
            const userId = parseInt(parts[3]);

            const user = MOCK_USERS.find(u => u.id === userId);

            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                resolve({ success: true, data: userWithoutPassword });
            } else {
                reject({ success: false, message: 'User not found' });
            }
        }, 300);
    });
};
