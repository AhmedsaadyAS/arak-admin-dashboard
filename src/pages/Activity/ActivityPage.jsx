import React from 'react';
import { UserCheck, Award, MessageSquare, CreditCard, UserPlus, Calendar, Clock, Bell, TrendingDown, Users as UsersIcon } from 'lucide-react';
import { activityData } from '../../mock/activity';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

const iconMap = {
    UserCheck, Award, MessageSquare, CreditCard, UserPlus, Calendar, Clock, Bell, TrendingDown, Users: UsersIcon
};

export default function ActivityPage() {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#EE3636';
            case 'medium': return '#FFA756';
            case 'low': return '#A098AE';
            default: return 'var(--primary-color)';
        }
    };

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Latest Activity</h3>
            </div>

            <div className="chart-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activityData.map(activity => {
                        const IconComponent = iconMap[activity.icon] || Bell;
                        return (
                            <div
                                key={activity.id}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${getPriorityColor(activity.priority)}`
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: getPriorityColor(activity.priority) + '20',
                                    color: getPriorityColor(activity.priority),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <IconComponent size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dark)' }}>{activity.title}</h4>
                                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{activity.description}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{activity.timestamp}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
