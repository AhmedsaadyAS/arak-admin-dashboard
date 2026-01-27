import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { MemoryRouter } from 'react-router-dom';

// Mock Modules
vi.mock('../../services/authService');

// Mock specific parts of react-router-dom while keeping MemoryRouter working
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock clipboard API
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};
Object.assign(navigator, { clipboard: mockClipboard });

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );
    };

    it('renders login fields and button', () => {
        renderLogin();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByText(/one-click super admin login/i)).toBeInTheDocument();
    });

    it('shows validation errors for invalid inputs', async () => {
        renderLogin();

        const signInBtn = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(signInBtn);

        // Required fields
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        // Invalid email format
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(signInBtn);

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });
    });

    it('shows loading spinner during submission', async () => {
        // Create a promise that doesn't resolve immediately to keep spinner active
        authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderLogin();

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'admin@arak.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });

        const signInBtn = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(signInBtn);

        // Helper to find spinner by class name since it has no role
        expect(await screen.findByText(/signing in.../i)).toBeInTheDocument();
    });

    it('redirects to dashboard on successful login', async () => {
        const mockResponse = {
            success: true,
            data: {
                user: { id: 1, name: 'Admin', role: 'admin' },
                token: 'mock-jwt-token'
            }
        };
        authService.login.mockResolvedValue(mockResponse);

        renderLogin();

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'admin@arak.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('copy functionality interacts with clipboard API', async () => {
        renderLogin();

        // Find copy buttons (there are multiple, grab email one)
        const copyButtons = screen.getAllByText(/copy/i);
        // The accessible way would be role button, but we have text. 
        // Based on UI provided in file content log:
        // button contains <Copy /> icon and text "Copy" inside

        fireEvent.click(copyButtons[0]); // Click first copy button

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('admin@arak.com');

        // Should verify text changes to "Copied!" temporarily
        await waitFor(() => {
            expect(screen.getByText(/copied!/i)).toBeInTheDocument();
        });
    });
});
