import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f3f4f6',
            color: '#1f2937'
        }}>
            <ShieldAlert size={64} color="#dc2626" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Access Denied</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>You do not have permission to view this page.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: '#2563eb',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Login
                </button>
            </div>
        </div>
    );
}
