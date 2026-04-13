import React from 'react';
import PropTypes from 'prop-types';
import { Copy } from 'lucide-react';

/**
 * Demo Credentials Component
 * Displays demo login credentials with copy and quick login functionality
 */
export default function DemoCredentials({ onQuickLogin, copySuccess = '', onCopy }) {
    const demoAccounts = [
        { email: 'admin@arak.com', password: 'Admin@123', label: '📧', description: 'Super Admin' },
        { email: 'parent1@arak.com', password: 'Parent@123', label: '👤', description: 'Test Restriction' },
    ];

    const roleAccounts = [
        { email: 'academic@arak.com', password: 'Academic Admin@123', label: 'Login as Academic Admin' },
        { email: 'teacher1@arak.com', password: 'Teacher@123', label: 'Login as Teacher' },
    ];

    return (
        <div className="demo-credentials">
            <p className="text-sm text-gray-700 font-semibold mb-3">🚀 Quick Demo Access</p>

            <div className="text-xs text-gray-600 space-y-2">
                {/* Main demo accounts with copy */}
                {demoAccounts.map((account, index) => (
                    <React.Fragment key={account.email}>
                        <div className="credential-row">
                            <span>
                                {account.label} <strong>{account.email}</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => onCopy(account.email, 'email')}
                                className="copy-button"
                            >
                                <Copy size={12} />
                                {copySuccess === 'email' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="credential-row">
                            <span>
                                🔑 <strong>{account.password}</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => onCopy(account.password, 'password')}
                                className="copy-button"
                            >
                                <Copy size={12} />
                                {copySuccess === 'password' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        {index === 0 && (
                            <div
                                className="credential-row"
                                style={{ marginTop: '0.5rem', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}
                            />
                        )}
                        {index === 1 && (
                            <div className="credential-row">
                                <button
                                    type="button"
                                    onClick={() => onQuickLogin(account.email, account.password)}
                                    className="copy-button"
                                    style={{ width: 'auto', padding: '2px 8px' }}
                                >
                                    {account.description}
                                </button>
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {/* Role-based quick login buttons */}
                <div className="credential-row" style={{ marginTop: '0.5rem', display: 'flex', gap: '8px' }}>
                    {roleAccounts.map((account) => (
                        <button
                            key={account.email}
                            type="button"
                            onClick={() => onQuickLogin(account.email, account.password)}
                            className="copy-button"
                            style={{ width: 'auto', padding: '2px 8px', flex: 1, justifyContent: 'center' }}
                        >
                            {account.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

DemoCredentials.propTypes = {
    onQuickLogin: PropTypes.func.isRequired,
    copySuccess: PropTypes.string,
    onCopy: PropTypes.func.isRequired
};


