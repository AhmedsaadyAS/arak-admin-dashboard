import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import React from 'react';

// Wrapper for hooks
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it('isAuthenticated returns false initially', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.isAuthenticated()).toBe(false);
    });

    it('login function stores token and user in localStorage (rememberMe=true)', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        const mockUser = { id: 1, name: 'Test User' };
        const mockToken = 'test-token';

        act(() => {
            result.current.login(mockUser, mockToken, true);
        });

        expect(localStorage.getItem('arak_auth_token')).toBe(mockToken);
        expect(localStorage.getItem('arak_user')).toEqual(JSON.stringify(mockUser));
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated()).toBe(true);
    });

    it('login function stores token in sessionStorage (rememberMe=false)', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        const mockUser = { id: 1, name: 'Test User' };
        const mockToken = 'session-token';

        act(() => {
            result.current.login(mockUser, mockToken, false);
        });

        expect(sessionStorage.getItem('arak_auth_token')).toBe(mockToken);
        expect(localStorage.getItem('arak_auth_token')).toBeNull();
        expect(result.current.isAuthenticated()).toBe(true);
    });

    it('logout successfully clears all auth data', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Setup initial state
        localStorage.setItem('arak_auth_token', 'token');
        localStorage.setItem('arak_user', JSON.stringify({ id: 1 }));

        act(() => {
            result.current.logout();
        });

        expect(localStorage.getItem('arak_auth_token')).toBeNull();
        expect(localStorage.getItem('arak_user')).toBeNull();
        expect(sessionStorage.getItem('arak_auth_token')).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated()).toBe(false);
    });

    it('getToken retrieves token from correct storage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        localStorage.setItem('arak_auth_token', 'local-token');
        expect(result.current.getToken()).toBe('local-token');

        localStorage.removeItem('arak_auth_token');
        sessionStorage.setItem('arak_auth_token', 'session-token');
        expect(result.current.getToken()).toBe('session-token');
    });
});
