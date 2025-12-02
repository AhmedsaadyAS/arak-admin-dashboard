import React from 'react';
import { Mail, Phone, MapPin, Calendar, BookOpen, Users } from 'lucide-react';
import { teachersData } from '../../mock/teachers';
import { scheduleData } from '../../mock/schedule';
import './TeacherDetails.css';

export default function TeacherDetails({ teacherId, onBack }) {
    const teacher = teachersData.find(t => t.id === teacherId);
    const schedule = scheduleData[`teacherSchedule_${teacherId}`] || [];

    if (!teacher) {
        return <div className="dashboard-page"><div className="chart-card"><h3>Teacher not found</h3></div></div>;
    }

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Teachers</button>

            {/* Header Card */}
            <div className="teacher-header-card">
                <div className="teacher-header-left">
                    <div className="teacher-photo">{teacher.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="teacher-header-info">
                        <h2>{teacher.name}</h2>
                        <p className="teacher-id">{teacher.teacherId}</p>
                        <div className="teacher-badges">
                            <span className="badge" style={{ background: 'var(--secondary-color)', color: 'white' }}>
                                <BookOpen size={14} style={{ marginRight: '0.5rem' }} />
                                {teacher.subject}
                            </span>
                            <span className="badge" style={{ background: '#E6F9F0', color: '#00B69B' }}>{teacher.status}</span>
                        </div>
                    </div>
                </div>

                <div className="teacher-header-right">
                    <div className="info-row">
                        <Mail size={16} />
                        <span>{teacher.email}</span>
                    </div>
                    <div className="info-row">
                        <Phone size={16} />
                        <span>{teacher.phone}</span>
                    </div>
                    <div className="info-row">
                        <MapPin size={16} />
                        <span>{teacher.city}</span>
                    </div>
                    <div className="info-row">
                        <Calendar size={16} />
                        <span>Joined: {teacher.dateJoined}</span>
                    </div>
                </div>
            </div>

            <div className="teacher-details-grid">
                {/* Main Content */}
                <div className="teacher-main-content">
                    {/* About Section */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>About</h3>
                        </div>
                        <p style={{ color: 'var(--text-gray)', lineHeight: 1.6 }}>{teacher.about}</p>
                    </div>

                    {/* Education & Expertise */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Education & Expertise</h3>
                        </div>
                        <div className="education-section">
                            <div className="education-item">
                                <h4>Education</h4>
                                <p>{teacher.education}</p>
                            </div>
                            <div className="education-item">
                                <h4>Areas of Expertise</h4>
                                <div className="expertise-tags">
                                    {teacher.expertise.map((exp, i) => (
                                        <span key={i} className="badge" style={{ background: '#F3F4FF', color: 'var(--primary-color)', margin: '0.25rem' }}>
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Classes */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3><Users size={20} /> Assigned Classes</h3>
                        </div>
                        <div className="classes-grid">
                            {teacher.assignedClasses.map((className, i) => (
                                <div key={i} className="class-card">
                                    <div className="class-icon">
                                        <Users size={24} />
                                    </div>
                                    <div className="class-info">
                                        <h4>Grade {className}</h4>
                                        <p>{teacher.subject}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="teacher-sidebar">
                    {/* Weekly Schedule */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Weekly Schedule</h3>
                        </div>
                        <div className="schedule-list">
                            {schedule.map((item, index) => (
                                <div key={index} className="schedule-item">
                                    <div className="schedule-day">{item.day}</div>
                                    <div className="schedule-details">
                                        <strong>{item.class}</strong>
                                        <p>{item.time}</p>
                                        <p className="schedule-room">Room: {item.room}</p>
                                    </div>
                                </div>
                            ))}
                            {schedule.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '2rem' }}>No schedule available</p>
                            )}
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Performance Overview</h3>
                        </div>
                        <div className="stats-overview">
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: 'var(--primary-color)' }}>{teacher.assignedClasses.length}</span>
                                <span className="stat-label">Classes</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#00B69B' }}>4.8/5.0</span>
                                <span className="stat-label">Rating</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: 'var(--secondary-color)' }}>95%</span>
                                <span className="stat-label">Attendance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
