import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Edit3
} from 'lucide-react';
import { api } from '../services/api';
import AttendanceEditModal from '../components/attendance/AttendanceEditModal';
import './AttendanceStudentDetails.css';

export default function AttendanceStudentDetails() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    
    // Date & Navigation State
    const [viewDate, setViewDate] = useState(new Date()); // Current month in view
    const today = new Date();
    
    // Data State
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch initial student info
    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                const data = await api.getStudentById(studentId);
                setStudent(data);
            } catch (err) {
                console.error("Failed to fetch student:", err);
            }
        };
        fetchStudentInfo();
    }, [studentId]);

    // Fetch stats and monthly records
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const month = viewDate.getMonth() + 1;
            const year = viewDate.getFullYear();
            
            const [statsData, monthlyRecords] = await Promise.all([
                api.getStudentAttendanceStats(studentId),
                api.getStudentAttendanceByMonth(studentId, month, year)
            ]);
            
            setStats(statsData);
            setRecords(monthlyRecords || []);
        } catch (err) {
            console.error("Failed to fetch attendance details:", err);
            setError("Failed to load attendance history.");
        } finally {
            setLoading(false);
        }
    }, [studentId, viewDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Calendar Grid Calculation
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        // Days to pad at start (Mon-Sun layout)
        let startPadding = firstDayOfMonth.getDay(); 
        if (startPadding === 0) startPadding = 7; // Convert Sun to 7
        startPadding -= 1; // Mon=0 padding

        const days = [];
        
        // Padding
        for (let i = 0; i < startPadding; i++) {
            days.push({ type: 'padding' });
        }
        
        // Days of month
        for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const record = records.find(r => r.date === dateStr);
            const dateObj = new Date(year, month, d);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            
            days.push({
                type: 'day',
                day: d,
                date: dateStr,
                status: record?.status || (isWeekend ? 'Weekend' : 'NotMarked'),
                record,
                isWeekend
            });
        }
        
        return days;
    }, [viewDate, records]);

    // Derived Today's Record
    const todayStr = today.toISOString().split('T')[0];
    const todayRecord = useMemo(() => {
        return records.find(r => r.date === todayStr);
    }, [records, todayStr]);

    const handleSaveAttendance = async (updatedData) => {
        try {
            if (todayRecord && todayRecord.id > 0) {
                await api.updateAttendance(todayRecord.id, updatedData);
            } else {
                await api.markAttendance({
                    studentId: parseInt(studentId, 10),
                    date: todayStr,
                    ...updatedData
                });
            }
            setShowEditModal(false);
            fetchData();
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to update attendance");
        }
    };

    if (loading && !student) return <div className="loading-container">Loading student profile...</div>;
    if (error) return <div className="error-container">{error}</div>;

    const lastUpdated = todayRecord?.updatedAt 
        ? new Date(todayRecord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Not marked today';

    return (
        <div className="std-details-container animate-fade-in">
            {/* 1. Student Header Card */}
            <div className="std-profile-header">
                <button className="back-circle-btn" onClick={() => navigate('/attendance')}>
                    <ChevronLeft size={20} />
                </button>
                <div className="std-profile-main">
                    <div className="std-big-avatar">
                       {student?.name?.charAt(0) || <User />}
                    </div>
                    <div className="std-profile-info">
                        <h2>{student?.name}</h2>
                        <p>{student?.grade} - {student?.className}</p>
                    </div>
                </div>
            </div>

            <div className="std-details-content">
                {/* 2. Today's Status Card */}
                <div className={`today-card ${todayRecord?.status?.toLowerCase() || 'notmarked'}`}>
                    <div className="today-header">
                        <div className="today-icon-box">
                            {todayRecord?.status === 'Present' && <CheckCircle2 size={32} />}
                            {todayRecord?.status === 'Absent' && <XCircle size={32} />}
                            {todayRecord?.status === 'Late' && <Clock size={32} />}
                            {(!todayRecord || todayRecord.status === 'NotMarked') && <CalendarIcon size={32} />}
                        </div>
                        <div className="today-title">
                            <h3>{todayRecord?.status ? `${todayRecord.status} Today` : 'Not Marked Today'}</h3>
                            <span>{today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="today-times">
                        <div className="time-box">
                            <label>Punch In</label>
                            <strong>{todayRecord?.timeIn ? todayRecord.timeIn.substring(0, 5) : '--:--'}</strong>
                        </div>
                        <div className="time-box">
                            <label>Punch Out</label>
                            <strong>{todayRecord?.timeOut ? todayRecord.timeOut.substring(0, 5) : '--:--'}</strong>
                        </div>
                    </div>
                </div>

                {/* 3. Stats Grid */}
                <div className="std-stats-grid">
                    <div className="std-stat-card">
                        <span className="stat-label">Attendance Rate</span>
                        <h4 className="stat-value">{stats?.attendanceRate ?? '--'}%</h4>
                    </div>
                    <div className="std-stat-card">
                        <span className="stat-label">Late Arrivals</span>
                        <h4 className="stat-value">{stats?.lateArrivals ?? '0'}</h4>
                    </div>
                    <div className="std-stat-card">
                        <span className="stat-label">Absences</span>
                        <h4 className="stat-value">{stats?.absences ?? '0'}</h4>
                    </div>
                </div>

                {/* 4. Monthly Calendar */}
                <div className="cal-section">
                    <div className="cal-header">
                        <h3>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <div className="cal-controls">
                            <button className="cal-nav-btn" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
                            <button className="cal-nav-btn" onClick={handleNextMonth}><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    
                    <div className="cal-grid">
                        <div className="day-name">Mon</div>
                        <div className="day-name">Tue</div>
                        <div className="day-name">Wed</div>
                        <div className="day-name">Thu</div>
                        <div className="day-name">Fri</div>
                        <div className="day-name">Sat</div>
                        <div className="day-name">Sun</div>
                        
                        {calendarDays.map((day, idx) => (
                            <div 
                                key={idx} 
                                className={`cal-cell ${day.type} ${day.isWeekend ? 'weekend' : ''} status-${day.status?.toLowerCase() || ''}`}
                            >
                                {day.day && <span className="cell-num">{day.day}</span>}
                                {day.status && day.status !== 'Weekend' && day.status !== 'NotMarked' && (
                                    <div className="status-indicator"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="cal-key">
                        <div className="key-item"><i className="key-dot present"></i> Present</div>
                        <div className="key-item"><i className="key-dot absent"></i> Absent</div>
                        <div className="key-item"><i className="key-dot late"></i> Late</div>
                    </div>
                </div>

                {/* 5. Footer Bar */}
                <div className="std-footer-bar">
                    <div className="audit-info">
                        <span className="audit-label">Last Synchronization</span>
                        <p className="audit-time">{lastUpdated}</p>
                    </div>
                    <button className="edit-entry-btn" onClick={() => setShowEditModal(true)}>
                        <Edit3 size={18} />
                        Update Today
                    </button>
                </div>
            </div>

            {/* Shared Modal */}
            {showEditModal && (
                <AttendanceEditModal 
                    record={todayRecord || { studentName: student?.name, status: 'NotMarked', id: 0, studentId: student?.id }}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveAttendance}
                />
            )}
        </div>
    );
}
