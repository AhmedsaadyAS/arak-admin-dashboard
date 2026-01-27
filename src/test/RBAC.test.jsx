import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

// Mock Component to Protect
const ProtectedContent = () => <div>Sensitive Data</div>;

describe('RBAC Guard (ProtectedRoute)', () => {

    const mockAuth = (user, isAuthenticated = true) => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user,
            isAuthenticated: () => isAuthenticated,
            loading: false,
            hasRole: (roles) => {
                if (!user || !user.role) return false;
                const allowed = Array.isArray(roles) ? roles : [roles];
                if (user.role === 'Super Admin') return true;
                return allowed.includes(user.role);
            }
        });
    };

    it('should redirect unauthenticated users to login', () => {
        mockAuth(null, false);
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/protected" element={<ProtectedRoute><ProtectedContent /></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeDefined();
    });

    it('should allow Admin to access default protected route', () => {
        mockAuth({ username: 'admin', role: 'Admin' });
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={<ProtectedRoute><ProtectedContent /></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Sensitive Data')).toBeDefined();
    });

    it('should redirect Teacher to Unauthorized for default protected route (Admin Only)', () => {
        mockAuth({ username: 'teacher', role: 'Teacher' });
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/unauthorized" element={<div>Access Denied</div>} />
                    <Route path="/protected" element={<ProtectedRoute><ProtectedContent /></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Access Denied')).toBeDefined();
    });

    it('should redirect Parent to Unauthorized for default protected route', () => {
        mockAuth({ username: 'parent', role: 'Parent' });
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/unauthorized" element={<div>Access Denied</div>} />
                    <Route path="/protected" element={<ProtectedRoute><ProtectedContent /></ProtectedRoute>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Access Denied')).toBeDefined();
    });

    it('should allow Teacher if allowedRoles includes Teacher', () => {
        mockAuth({ username: 'teacher', role: 'Teacher' });
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={
                        <ProtectedRoute allowedRoles={['Teacher']}>
                            <ProtectedContent />
                        </ProtectedRoute>
                    } />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Sensitive Data')).toBeDefined();
    });
});
