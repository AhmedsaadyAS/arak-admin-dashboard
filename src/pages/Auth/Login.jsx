import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Copy, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import logo from '../../assets/logo.png';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError('');

        try {
            const response = await authService.login(data.email, data.password);

            if (response.success) {
                // Store auth data using AuthContext
                authLogin(response.data.user, response.data.token, data.rememberMe);

                // Redirect to the page they tried to visit or dashboard
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }
        } catch (error) {
            setLoginError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setValue('email', 'admin@arak.com');
        setValue('password', 'admin123');
        setValue('rememberMe', true);

        // Auto-submit after a short delay to show the filled values
        setTimeout(() => {
            handleSubmit(onSubmit)();
        }, 300);
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(type);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="login-container">
            {/* Left Side - Branding */}
            <div className="relative flex-1 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center p-16 overflow-hidden">
                {/* Circuit Board Pattern - Top Left Corner */}
                <div className="absolute top-0 left-0 w-80 h-80 opacity-20 pointer-events-none overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current">
                        {/* Circuit Traces */}
                        <path d="M10 0 V20 L30 40 H50" strokeWidth="1" />
                        <circle cx="50" cy="40" r="1.5" fill="currentColor" />

                        <path d="M0 30 H20 L40 50 V70" strokeWidth="1" />
                        <circle cx="40" cy="70" r="1.5" fill="currentColor" />

                        <path d="M60 0 V15 L80 35 H100" strokeWidth="1" />
                        <circle cx="60" cy="0" r="1.5" fill="currentColor" />

                        <path d="M0 60 H15 L35 80 V100" strokeWidth="1" />
                        <circle cx="35" cy="80" r="1.5" fill="currentColor" />

                        <path d="M80 10 V25 H60" strokeWidth="1" />
                        <circle cx="60" cy="25" r="1.5" fill="currentColor" />

                        <path d="M20 90 H35 V70" strokeWidth="1" />
                        <circle cx="35" cy="70" r="1.5" fill="currentColor" />

                        {/* Geometric Accents */}
                        <rect x="15" y="15" width="4" height="4" strokeWidth="0" fill="currentColor" opacity="0.6" />
                        <rect x="70" y="70" width="6" height="6" strokeWidth="0" fill="currentColor" opacity="0.4" />
                        <circle cx="85" cy="55" r="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>

                {/* Circuit Board Pattern - Top Right Corner */}
                <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none overflow-hidden rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current">
                        <path d="M10 0 V20 L30 40 H50" strokeWidth="1" />
                        <circle cx="50" cy="40" r="1.5" fill="currentColor" />
                        <path d="M0 30 H20 L40 50 V70" strokeWidth="1" />
                        <circle cx="40" cy="70" r="1.5" fill="currentColor" />
                        <path d="M60 0 V15 L80 35 H100" strokeWidth="1" />
                        <circle cx="60" cy="0" r="1.5" fill="currentColor" />
                        <path d="M0 60 H15 L35 80 V100" strokeWidth="1" />
                        <circle cx="35" cy="80" r="1.5" fill="currentColor" />
                        <path d="M80 10 V25 H60" strokeWidth="1" />
                        <circle cx="60" cy="25" r="1.5" fill="currentColor" />
                        <path d="M20 90 H35 V70" strokeWidth="1" />
                        <circle cx="35" cy="70" r="1.5" fill="currentColor" />
                        <rect x="15" y="15" width="4" height="4" strokeWidth="0" fill="currentColor" opacity="0.6" />
                        <rect x="70" y="70" width="6" height="6" strokeWidth="0" fill="currentColor" opacity="0.4" />
                        <circle cx="85" cy="55" r="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>

                {/* Circuit Board Pattern - Bottom Left Corner */}
                <div className="absolute bottom-0 left-0 w-80 h-80 opacity-20 pointer-events-none overflow-hidden -rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current">
                        <path d="M10 0 V20 L30 40 H50" strokeWidth="1" />
                        <circle cx="50" cy="40" r="1.5" fill="currentColor" />
                        <path d="M0 30 H20 L40 50 V70" strokeWidth="1" />
                        <circle cx="40" cy="70" r="1.5" fill="currentColor" />
                        <path d="M60 0 V15 L80 35 H100" strokeWidth="1" />
                        <circle cx="60" cy="0" r="1.5" fill="currentColor" />
                        <path d="M0 60 H15 L35 80 V100" strokeWidth="1" />
                        <circle cx="35" cy="80" r="1.5" fill="currentColor" />
                        <path d="M80 10 V25 H60" strokeWidth="1" />
                        <circle cx="60" cy="25" r="1.5" fill="currentColor" />
                        <path d="M20 90 H35 V70" strokeWidth="1" />
                        <circle cx="35" cy="70" r="1.5" fill="currentColor" />
                        <rect x="15" y="15" width="4" height="4" strokeWidth="0" fill="currentColor" opacity="0.6" />
                        <rect x="70" y="70" width="6" height="6" strokeWidth="0" fill="currentColor" opacity="0.4" />
                        <circle cx="85" cy="55" r="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>

                {/* Circuit Board Pattern - Bottom Right Corner */}
                <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 pointer-events-none overflow-hidden rotate-180">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current">
                        <path d="M10 0 V20 L30 40 H50" strokeWidth="1" />
                        <circle cx="50" cy="40" r="1.5" fill="currentColor" />
                        <path d="M0 30 H20 L40 50 V70" strokeWidth="1" />
                        <circle cx="40" cy="70" r="1.5" fill="currentColor" />
                        <path d="M60 0 V15 L80 35 H100" strokeWidth="1" />
                        <circle cx="60" cy="0" r="1.5" fill="currentColor" />
                        <path d="M0 60 H15 L35 80 V100" strokeWidth="1" />
                        <circle cx="35" cy="80" r="1.5" fill="currentColor" />
                        <path d="M80 10 V25 H60" strokeWidth="1" />
                        <circle cx="60" cy="25" r="1.5" fill="currentColor" />
                        <path d="M20 90 H35 V70" strokeWidth="1" />
                        <circle cx="35" cy="70" r="1.5" fill="currentColor" />
                        <rect x="15" y="15" width="4" height="4" strokeWidth="0" fill="currentColor" opacity="0.6" />
                        <rect x="70" y="70" width="6" height="6" strokeWidth="0" fill="currentColor" opacity="0.4" />
                        <circle cx="85" cy="55" r="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>

                {/* Tech Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}>
                </div>

                {/* Giant Background Logo (Watermark) */}
                <div className="absolute -top-32 -right-32 w-[900px] h-[900px] opacity-20 pointer-events-none select-none">
                    <img
                        src={logo}
                        alt="Background Pattern"
                        className="w-full h-full object-contain rotate-12 mix-blend-overlay"
                    />
                </div>

                {/* Soft Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 mt-20">
                    {/* Main Title - No Logo */}
                    <h1 className="text-white font-bold text-5xl tracking-tight mb-2 drop-shadow-md">
                        ARAK Admin Dashboard
                    </h1>

                    {/* Description */}
                    <p className="text-blue-100 font-light text-xl max-w-md leading-relaxed">
                        Streamline school management with our comprehensive admin platform
                    </p>

                    {/* Feature Cards with Glassmorphism */}
                    <div className="flex flex-col gap-4 w-full max-w-sm mt-6">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all">
                            <div className="text-3xl">📊</div>
                            <div className="text-white font-medium">Real-time Analytics</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all">
                            <div className="text-3xl">👥</div>
                            <div className="text-white font-medium">Student & Teacher Management</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all">
                            <div className="text-3xl">💬</div>
                            <div className="text-white font-medium">Parent Communication</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    <div className="form-header">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to access your dashboard</p>
                    </div>

                    {loginError && (
                        <div className="error-alert">
                            <AlertCircle className="error-icon" size={20} />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                                    placeholder="admin@arak.com"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="error-message">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="error-message">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    {...register('rememberMe')}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="submit-button"
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="demo-credentials">
                        <p className="text-sm text-gray-700 font-semibold mb-3">🚀 Quick Demo Access</p>

                        <div className="text-xs text-gray-600 space-y-2">
                            <div className="credential-row">
                                <span>📧 <strong>admin@arak.com</strong></span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard('admin@arak.com', 'email')}
                                    className="copy-button"
                                >
                                    <Copy size={12} />
                                    {copySuccess === 'email' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="credential-row">
                                <span>🔑 <strong>admin123</strong></span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard('admin123', 'password')}
                                    className="copy-button"
                                >
                                    <Copy size={12} />
                                    {copySuccess === 'password' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="credential-row" style={{ marginTop: '0.5rem', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}>
                                <span>👤 <strong>parent@arak.com</strong></span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValue('email', 'parent@arak.com');
                                        setValue('password', 'parent123');
                                        handleSubmit(onSubmit)();
                                    }}
                                    className="copy-button"
                                    style={{ width: 'auto', padding: '2px 8px' }}
                                >
                                    Test Restriction
                                </button>
                            </div>
                        </div>

                        <div className="credential-row" style={{ marginTop: '0.5rem', display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('email', 'fees@arak.com');
                                    setValue('password', 'fees123');
                                    handleSubmit(onSubmit)();
                                }}
                                className="copy-button"
                                style={{ width: 'auto', padding: '2px 8px', flex: 1, justifyContent: 'center' }}
                            >
                                Login as Fees Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue('email', 'users@arak.com');
                                    setValue('password', 'users123');
                                    handleSubmit(onSubmit)();
                                }}
                                className="copy-button"
                                style={{ width: 'auto', padding: '2px 8px', flex: 1, justifyContent: 'center' }}
                            >
                                Login as User Admin
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="demo-login-button"
                    >
                        <Zap size={16} />
                        One-Click Super Admin Login
                    </button>
                </div>
            </div>
        </div>

    );
}
