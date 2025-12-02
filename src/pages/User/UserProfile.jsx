import React from 'react';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function UserProfile() {
    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>User Profile</h3>
            </div>

            <div className="chart-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#C1BBEB' }}></div>
                    <h3 style={{ margin: 0 }}>Nabila A.</h3>
                    <span style={{ color: '#A098AE' }}>Admin</span>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#A098AE', fontSize: '0.9rem' }}>Full Name</label>
                        <input type="text" value="Nabila A." readOnly style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold', color: 'var(--text-dark)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#A098AE', fontSize: '0.9rem' }}>Email</label>
                        <input type="text" value="nabila@arak.com" readOnly style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold', color: 'var(--text-dark)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#A098AE', fontSize: '0.9rem' }}>Phone</label>
                        <input type="text" value="+12 345 6789 0" readOnly style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold', color: 'var(--text-dark)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#A098AE', fontSize: '0.9rem' }}>Address</label>
                        <input type="text" value="Jakarta, Indonesia" readOnly style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold', color: 'var(--text-dark)' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
