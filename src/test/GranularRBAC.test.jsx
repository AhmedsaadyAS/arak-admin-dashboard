import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

// Mock Component
const Page = ({ title }) => <div>{title}</div>;

describe('Granular RBAC', () => {

    const mockAuth = (user) => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user,
            isAuthenticated: () => true,
            loading: false,
            hasRole: (allowedRoles) => {
                if (!user) return false;
                if (user.role === 'Super Admin') return true;
                const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
                return roles.includes(user.role);
            }
        });
    };

    it('Fees Admin should access Fees page', () => {
        mockAuth({ role: 'Fees Admin' });
        render(
            <MemoryRouter initialEntries={['/fees']}>
                <Routes>
                    <Route path="/fees" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Fees Admin']}>
                            <Page title="Fees Page" />
                        </ProtectedRoute>
                    } />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Fees Page')).toBeDefined();
    });

    it('Fees Admin should NOT access User Management', () => {
        mockAuth({ role: 'Fees Admin' });
        render(
            <MemoryRouter initialEntries={['/user']}>
                <Routes>
                    <Route path="/unauthorized" element={<div>Access Denied</div>} />
                    <Route path="/user" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Users Admin']}>
                            <Page title="Users Page" />
                        </ProtectedRoute>
                    } />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Access Denied')).toBeDefined();
    });

    it('Users Admin should access Students page', () => {
        mockAuth({ role: 'Users Admin' });
        render(
            <MemoryRouter initialEntries={['/students']}>
                <Routes>
                    <Route path="/students" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Users Admin']}>
                            <Page title="Students Page" />
                        </ProtectedRoute>
                    } />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Students Page')).toBeDefined();
    });
});
