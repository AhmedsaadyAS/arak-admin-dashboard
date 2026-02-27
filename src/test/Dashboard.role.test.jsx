import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import * as AuthContext from '../context/AuthContext';

describe('Dashboard Role-Based Rendering', () => {
    it('Fees Admin should access Dashboard without Access Denied', () => {
        // Mock useAuth to return Fees Admin
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'fees@arak.com', role: 'Fees Admin' },
            isAuthenticated: true,
            loading: false
        });

        const { container } = render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Should NOT show "Access Denied"
        expect(screen.queryByText(/access denied/i)).not.toBeInTheDocument();

        // Should render the dashboard page
        expect(container.querySelector('.dashboard-page')).toBeInTheDocument();
    });

    it('Users Admin should see Students and Teachers stats', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'users@arak.com', role: 'Users Admin' },
            isAuthenticated: true,
            loading: false
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Should see Students and Teachers stat cards
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Teachers')).toBeInTheDocument();
    });

    it('Users Admin should NOT see Events or Messages stats', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'users@arak.com', role: 'Users Admin' },
            isAuthenticated: true,
            loading: false
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Should NOT see Events or Messages stat cards (filtered by role)
        expect(screen.queryByText('Events')).not.toBeInTheDocument();
        expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    });

    it('Academic Admin should see Performance Chart and Attendance', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'academic@arak.com', role: 'Academic Admin' },
            isAuthenticated: true,
            loading: false
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Should see School Performance and Attendance List
        expect(screen.getByText('School Performance')).toBeInTheDocument();
        expect(screen.getByText('Attendance List')).toBeInTheDocument();
    });

    it('Super Admin should see everything', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { email: 'admin@arak.com', role: 'Super Admin' },
            isAuthenticated: true,
            loading: false
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Should see all stat cards
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Teachers')).toBeInTheDocument();
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Messages')).toBeInTheDocument();

        // Should see all charts
        expect(screen.getByText('School Performance')).toBeInTheDocument();
        expect(screen.getByText('Attendance List')).toBeInTheDocument();
    });
});
