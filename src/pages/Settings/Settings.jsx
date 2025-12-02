import React, { useState } from 'react';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Settings() {
    const [schoolName, setSchoolName] = useState('Arak School');
    const [language, setLanguage] = useState('English');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        alert(`Settings saved!\nSchool Name: ${schoolName}\nLanguage: ${language}\nNotifications: ${notifications ? 'Enabled' : 'Disabled'}`);
    };

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Settings</h3>
            </div>

            <div className="chart-card">
                <h4 style={{ marginBottom: '1.5rem' }}>General Settings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div>
                            <h5 style={{ margin: 0 }}>School Name</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#A098AE' }}>Define the school name displayed in the app.</p>
                        </div>
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', minWidth: '200px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div>
                            <h5 style={{ margin: 0 }}>Language</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#A098AE' }}>System language.</p>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', minWidth: '150px', cursor: 'pointer' }}
                        >
                            <option>English</option>
                            <option>Arabic</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                        <div>
                            <h5 style={{ margin: 0 }}>Notifications</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#A098AE' }}>Enable or disable system notifications.</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            style={{
                                width: '50px',
                                height: '24px',
                                background: notifications ? 'var(--primary-color)' : '#e5e7eb',
                                borderRadius: '12px',
                                position: 'relative',
                                border: 'none',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                            title={notifications ? 'Disable notifications' : 'Enable notifications'}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: notifications ? '28px' : '2px',
                                transition: '0.3s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: '0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
