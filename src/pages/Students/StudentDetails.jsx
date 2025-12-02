import React from 'react';
import { Mail, Phone, MapPin, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { studentsData } from '../../mock/students';
import { attendanceData, attendanceSummary } from '../../mock/attendance';
import { scheduleData } from '../../mock/schedule';
import { gradesData } from '../../mock/grades';
import { feesData } from '../../mock/fees';
import { aiInsightsData } from '../../mock/aiInsights';
import './StudentDetails.css';

export default function StudentDetails({ studentId, onBack }) {
    const student = studentsData.find(s => s.id === studentId);
    const attendance = attendanceData[studentId] || [];
    const summary = attendanceSummary[studentId] || { present: 0, absent: 0, late: 0, total: 0 };
    const schedule = scheduleData[studentId] || [];
    const grades = gradesData[studentId] || [];
    const feeInfo = feesData[studentId] || { totalDue: 0, totalPaid: 0, outstanding: 0, invoices: [] };
    const aiInsight = aiInsightsData[studentId] || { riskLevel: 'Unknown', riskScore: 0, insights: [], recommendations: [] };

    if (!student) {
        return <div className="dashboard-page"><div className="chart-card"><h3>Student not found</h3></div></div>;
    }

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return '#EE3636';
            case 'Medium': return '#FFA756';
            case 'Low': return '#00B69B';
            default: return '#A098AE';
        }
    };

    const attendancePercent = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0;

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Students</button>

            {/* Header Card */}
            <div className="student-header-card">
                <div className="student-header-left">
                    <div className="student-photo">{student.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="student-header-info">
                        <h2>{student.name}</h2>
                        <p className="student-id">{student.studentId}</p>
                        <div className="student-badges">
                            <span className="badge" style={{ background: 'var(--primary-color)', color: 'white' }}>{student.grade}</span>
                            <span className="badge" style={{ background: '#E6F9F0', color: '#00B69B' }}>{student.status}</span>
                        </div>
                    </div>
                </div>

                <div className="student-header-right">
                    <div className="info-row">
                        <Mail size={16} />
                        <span>{student.email}</span>
                    </div>
                    <div className="info-row">
                        <Phone size={16} />
                        <span>{student.phone}</span>
                    </div>
                    <div className="info-row">
                        <MapPin size={16} />
                        <span>{student.address}</span>
                    </div>
                    <div className="info-row">
                        <Calendar size={16} />
                        <span>Enrolled: {student.enrollmentDate}</span>
                    </div>
                </div>

                <div className="student-header-parent">
                    <h4>Parent Information</h4>
                    <p><strong>{student.parentName}</strong></p>
                    <p><Phone size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />{student.parentPhone}</p>
                    <p><Mail size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />{student.parentEmail}</p>
                </div>
            </div>

            <div className="student-details-grid">
                {/* Main Content */}
                <div className="student-main-content">
                    {/* Attendance Table */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Attendance History</h3>
                        </div>
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.slice(0, 10).map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.date}</td>
                                        <td>
                                            <span className={`status-badge status-${record.status.toLowerCase()}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>{record.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Grades Table */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Academic Performance</h3>
                        </div>
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Teacher</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade, index) => (
                                    <tr key={index}>
                                        <td><strong>{grade.subject}</strong></td>
                                        <td>{grade.score}%</td>
                                        <td><span className="badge" style={{ background: grade.score >= 80 ? '#00B69B' : grade.score >= 60 ? '#FFA756' : '#EE3636', color: 'white' }}>{grade.grade}</span></td>
                                        <td>{grade.teacher}</td>
                                        <td>{grade.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="student-sidebar">
                    {/* AI Risk Indicator */}
                    <div className="chart-card risk-card" style={{ borderLeft: `4px solid ${getRiskColor(aiInsight.riskLevel)}` }}>
                        <div className="card-header">
                            <h3>AI Risk Analysis</h3>
                            <AlertTriangle size={20} color={getRiskColor(aiInsight.riskLevel)} />
                        </div>
                        <div className="risk-level" style={{ color: getRiskColor(aiInsight.riskLevel) }}>
                            <h2>{aiInsight.riskLevel} Risk</h2>
                            <p>Score: {aiInsight.riskScore}/100</p>
                        </div>
                        <div className="risk-insights">
                            <h4>Key Insights:</h4>
                            <ul>
                                {aiInsight.insights.map((insight, i) => (
                                    <li key={i}>{insight}</li>
                                ))}
                            </ul>
                            <h4 style={{ marginTop: '1rem' }}>Recommendations:</h4>
                            <ul>
                                {aiInsight.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Attendance Summary</h3>
                        </div>
                        <div className="attendance-summary">
                            <div className="summary-circle">
                                <span className="percentage">{attendancePercent}%</span>
                                <span className="label">Present</span>
                            </div>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <span className="stat-value" style={{ color: '#00B69B' }}>{summary.present}</span>
                                    <span className="stat-label">Present</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value" style={{ color: '#EE3636' }}>{summary.absent}</span>
                                    <span className="stat-label">Absent</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value" style={{ color: '#FFA756' }}>{summary.late}</span>
                                    <span className="stat-label">Late</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Weekly Schedule</h3>
                        </div>
                        <div className="schedule-list">
                            {schedule.slice(0, 5).map((item, index) => (
                                <div key={index} className="schedule-item">
                                    <div className="schedule-day">{item.day}</div>
                                    <div className="schedule-details">
                                        <strong>{item.subject}</strong>
                                        <p>{item.time}</p>
                                        <p className="schedule-teacher">{item.teacher}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fees Summary */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Fees Summary</h3>
                        </div>
                        <div className="fees-summary">
                            <div className="fee-item">
                                <span className="fee-label">Total Due</span>
                                <span className="fee-value">Rp {feeInfo.totalDue.toLocaleString()}</span>
                            </div>
                            <div className="fee-item">
                                <span className="fee-label">Total Paid</span>
                                <span className="fee-value" style={{ color: '#00B69B' }}>Rp {feeInfo.totalPaid.toLocaleString()}</span>
                            </div>
                            <div className="fee-item">
                                <span className="fee-label">Outstanding</span>
                                <span className="fee-value" style={{ color: feeInfo.outstanding > 0 ? '#EE3636' : '#00B69B' }}>Rp {feeInfo.outstanding.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
