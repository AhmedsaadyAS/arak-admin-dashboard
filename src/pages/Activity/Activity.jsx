import React from 'react';
import { AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Activity() {
    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>AI Analyser & Activity</h3>
                <span className="badge" style={{ background: '#E6F9F0', color: '#00B69B' }}>Beta Feature</span>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid #EE3636' }}>
                    <div className="stat-icon-wrapper" style={{ background: '#FEECEC' }}>
                        <AlertTriangle size={24} color="#EE3636" />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">High Risk Students</span>
                        <h3 className="stat-value">12</h3>
                        <span style={{ fontSize: '0.8rem', color: '#EE3636' }}>Needs Attention</span>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #00B69B' }}>
                    <div className="stat-icon-wrapper" style={{ background: '#E6F9F0' }}>
                        <TrendingUp size={24} color="#00B69B" />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Performance Up</span>
                        <h3 className="stat-value">85%</h3>
                        <span style={{ fontSize: '0.8rem', color: '#00B69B' }}>Class VII A</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card" style={{ flex: 2 }}>
                    <div className="card-header">
                        <h3>Smart Suggestions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: '#F3F4FF', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                            <p style={{ margin: 0, color: 'var(--text-dark)' }}>Student <strong>Karen Hope</strong> has missed 3 consecutive Math classes. Consider scheduling a parent meeting.</p>
                        </div>
                        <div style={{ padding: '1rem', background: '#F3F4FF', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                            <p style={{ margin: 0, color: 'var(--text-dark)' }}>Class <strong>VII B</strong> average score dropped by 10% in Physics. Review recent curriculum changes.</p>
                        </div>
                    </div>
                </div>

                <div className="chart-card" style={{ flex: 1 }}>
                    <div className="card-header">
                        <h3>Arak Chatbot</h3>
                    </div>
                    <div style={{ height: '300px', background: '#f9fafb', borderRadius: '12px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ alignSelf: 'flex-start', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px 12px 12px 0', border: '1px solid #e5e7eb' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Hello! How can I help you today?</p>
                            </div>
                            <div style={{ alignSelf: 'flex-end', background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px 12px 0 12px' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Show me attendance stats.</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <input type="text" placeholder="Type a message..." style={{ flex: 1, padding: '0.5rem', borderRadius: '20px', border: '1px solid #e5e7eb', outline: 'none' }} />
                            <button style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
