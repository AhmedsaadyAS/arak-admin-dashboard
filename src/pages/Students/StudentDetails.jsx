import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { attendanceData, attendanceSummary } from '../../mock/attendance';
import { getClassSchedule, formatTime, getDayName } from '../../utils/scheduleUtils';
import { calculateSubjectGrade, getPerformanceBreakdown, calculateOverallPerformance, assessmentsData } from '../../mock/assessments';
import { getStudentInsights } from '../../utils/aiInsights';
import { feesData } from '../../mock/fees';
import { subjectsData } from '../../mock/subjects';
import './StudentDetails.css';

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const data = await api.getStudentById(id);
                setStudent(data);
            } catch (error) {
                console.error("Failed to fetch student:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) {
        return <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>Reading student data...</div>;
    }

    if (!student) {
        return (
            <div className="dashboard-page">
                <button onClick={() => navigate('/students')} className="back-button">← Back to Students</button>
                <div className="chart-card"><h3>Student not found</h3></div>
            </div>
        );
    }

    // Convert string ID to number for mock data lookups if necessary, or keep as string if mock data uses strings
    // The current mock files likely use numbers, so we might need parseInt(id)
    const studentIdNum = parseInt(id);

    const attendance = attendanceData[studentIdNum] || [];
    const summary = attendanceSummary[studentIdNum] || { present: 0, absent: 0, late: 0, total: 0 };
    const feeInfo = feesData[studentIdNum] || { totalDue: 0, totalPaid: 0, outstanding: 0, invoices: [] };

    // New Data Integrations
    // Use optional chaining or defaults in case mock data doesn't match new API structure perfectly
    const schedule = getClassSchedule(student.classId || 1);
    const aiInsight = getStudentInsights(student);
    const overallPerformance = calculateOverallPerformance(studentIdNum);

    // Get unique subjects for this student
    const studentAssessments = assessmentsData.filter(a => a.studentId === studentIdNum);
    const subjectIds = [...new Set(studentAssessments.map(a => a.subjectId))];

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return '#EE3636';
            case 'Medium': return '#FFA756';
            case 'Low': return '#00B69B';
            default: return '#A098AE';
        }
    };

    const attendancePercent = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0;
    const weekDays = [0, 1, 2, 3, 4]; // Sun-Thu

    return (
        <div className="dashboard-page">
            <button onClick={() => navigate('/students')} className="back-button">← Back to Students</button>

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

                    {/* Academic Performance Section */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Academic Performance</h3>
                            <div className="performance-badge" style={{
                                background: overallPerformance >= 80 ? '#E6F9F0' : overallPerformance >= 60 ? '#FFF4E5' : '#FEECEC',
                                color: overallPerformance >= 80 ? '#00B69B' : overallPerformance >= 60 ? '#FFA756' : '#EE3636',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontWeight: 'bold'
                            }}>
                                Overall: {overallPerformance || 'N/A'}%
                            </div>
                        </div>

                        <div className="performance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                            {subjectIds.map(subjectId => {
                                const subject = subjectsData.find(s => s.id === subjectId);
                                const grade = calculateSubjectGrade(studentIdNum, subjectId);
                                const breakdown = getPerformanceBreakdown(studentIdNum, subjectId);

                                return (
                                    <div key={subjectId} style={{ border: '1px solid #E0E0E0', borderRadius: '12px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: subject?.color || '#ccc' }}></div>
                                                <h4 style={{ margin: 0 }}>{subject?.name}</h4>
                                            </div>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: grade >= 80 ? '#00B69B' : grade >= 60 ? '#FFA756' : '#EE3636'
                                            }}>{grade}%</span>
                                        </div>

                                        {/* Progress Bars */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#A098AE' }}>Tasks (20%)</span>
                                                <span>{Math.round(breakdown.tasks.percentage)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${breakdown.tasks.percentage}%`, height: '100%', background: '#4D44B5' }}></div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#A098AE' }}>Quizzes (10%)</span>
                                                <span>{Math.round(breakdown.quizzes.percentage)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${breakdown.quizzes.percentage}%`, height: '100%', background: '#FF8C00' }}></div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#A098AE' }}>Midterm (30%)</span>
                                                <span>{Math.round(breakdown.midterm.percentage)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${breakdown.midterm.percentage}%`, height: '100%', background: '#00B69B' }}></div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#A098AE' }}>Final (40%)</span>
                                                <span>{Math.round(breakdown.final.percentage)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${breakdown.final.percentage}%`, height: '100%', background: '#FB7D5B' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Class Schedule */}
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Class Schedule</h3>
                        </div>
                        <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            {weekDays.map(day => (
                                <div key={day} style={{ background: '#FAFAFA', borderRadius: '8px', padding: '0.75rem' }}>
                                    <h5 style={{ textAlign: 'center', color: '#4D44B5', marginBottom: '0.75rem' }}>{getDayName(day)}</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {schedule[day]?.map((lesson, idx) => (
                                            <div key={idx} style={{
                                                background: 'white',
                                                padding: '0.5rem',
                                                borderRadius: '6px',
                                                borderLeft: `3px solid ${lesson.subjectColor}`,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{lesson.subjectName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#A098AE' }}>{formatTime(lesson.startTime)}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#303972' }}>{lesson.room}</div>
                                            </div>
                                        ))}
                                        {(!schedule[day] || schedule[day].length === 0) && (
                                            <div style={{ textAlign: 'center', color: '#D0D0D0', fontSize: '0.8rem', padding: '1rem' }}>No classes</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance History */}
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
                                {attendance.slice(0, 5).map((record, index) => (
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
                            <p>{aiInsight.summary}</p>
                        </div>
                        <div className="risk-insights">
                            <h4>Risk Factors:</h4>
                            <ul>
                                {aiInsight.factors.map((factor, i) => (
                                    <li key={i}>{factor}</li>
                                ))}
                                {aiInsight.factors.length === 0 && <li>No significant risk factors detected.</li>}
                            </ul>
                            <h4 style={{ marginTop: '1rem' }}>Recommendations:</h4>
                            <ul>
                                {aiInsight.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                                {aiInsight.recommendations.length === 0 && <li>Keep up the good work!</li>}
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
