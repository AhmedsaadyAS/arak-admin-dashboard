import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Calendar, FileText, ChevronDown } from 'lucide-react';
import { attendanceData } from '../../mock/attendance';
import { assessmentsData, calculateOverallPerformance } from '../../mock/assessments';
import { studentsData } from '../../mock/students';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'grades'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('All Time');
    const [filterSubject, setFilterSubject] = useState('All');

    // --- ATTENDANCE LOGIC ---
    const attendanceList = useMemo(() => {
        let allRecords = [];
        Object.keys(attendanceData).forEach(studentId => {
            const student = studentsData.find(s => s.id === parseInt(studentId));
            if (student) {
                const records = attendanceData[studentId].map(record => ({
                    ...record,
                    studentName: student.name,
                    studentId: student.studentId,
                    studentClass: student.grade
                }));
                allRecords = [...allRecords, ...records];
            }
        });
        return allRecords;
    }, []);

    const filteredAttendance = useMemo(() => {
        return attendanceList.filter(record => {
            const matchesSearch = searchTerm === '' ||
                record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.studentId.includes(searchTerm);

            // Simple date filtering mock
            let matchesDate = true;
            if (filterDate === 'This Month') {
                const recordDate = new Date(record.date);
                const now = new Date(); // In mock, assuming 'now' is close to dates
                matchesDate = recordDate.getMonth() === 2; // Mock: March
            }

            return matchesSearch && matchesDate;
        });
    }, [attendanceList, searchTerm, filterDate]);

    // --- GRADES LOGIC ---
    const gradesList = useMemo(() => {
        // Flatten assessments for table view
        return assessmentsData.map(assessment => {
            const student = studentsData.find(s => s.id === assessment.studentId);
            const subjectMap = { 1: 'Mathematics', 2: 'Science', 3: 'English', 4: 'History' };
            return {
                ...assessment,
                studentName: student ? student.name : 'Unknown',
                studentId: student ? student.studentId : 'Unknown',
                studentClass: student ? student.grade : 'Unknown',
                subjectName: subjectMap[assessment.subjectId] || 'Unknown',
                percentage: Math.round((assessment.score / assessment.maxScore) * 100)
            };
        });
    }, []);

    const filteredGrades = useMemo(() => {
        return gradesList.filter(record => {
            const matchesSearch = searchTerm === '' ||
                record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSubject = filterSubject === 'All' || record.subjectName === filterSubject;

            return matchesSearch && matchesSubject;
        });
    }, [gradesList, searchTerm, filterSubject]);

    return (
        <div className="dashboard-page">
            <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Academic & Attendance Reports</h3>
                    <div className="topbar-actions">
                        <button className="icon-btn" style={{ width: 'auto', padding: '0 1rem', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', gap: '0.5rem' }}>
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'attendance' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'attendance' ? 'var(--primary-color)' : 'var(--text-gray)',
                            fontWeight: activeTab === 'attendance' ? '600' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Calendar size={18} /> Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('grades')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'grades' ? '3px solid var(--secondary-color)' : '3px solid transparent',
                            color: activeTab === 'grades' ? 'var(--secondary-color)' : 'var(--text-gray)',
                            fontWeight: activeTab === 'grades' ? '600' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FileText size={18} /> Grades
                    </button>
                </div>

                {/* Filters */}
                <div className="search-bar-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
                        <Search size={20} className="search-icon" style={{ color: '#A098AE' }} />
                        <input
                            type="text"
                            placeholder={activeTab === 'attendance' ? "Search student..." : "Search student or subject..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'attendance' ? (
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '40px', border: '1px solid #e5e7eb', color: '#303972', cursor: 'pointer' }}
                        >
                            <option>All Time</option>
                            <option>This Month</option>
                        </select>
                    ) : (
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '40px', border: '1px solid #e5e7eb', color: '#303972', cursor: 'pointer' }}
                        >
                            <option>All</option>
                            <option>Mathematics</option>
                            <option>Science</option>
                            <option>English</option>
                            <option>History</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Attendance Table */}
            {activeTab === 'attendance' && (
                <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="simple-table" style={{ width: '100%', padding: '0 1rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Class</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Time</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendance.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#303972' }}>{record.studentName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#A098AE' }}>{record.studentId}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#303972' }}>{record.studentClass}</td>
                                        <td style={{ padding: '1rem', color: '#303972' }}>{record.date}</td>
                                        <td style={{ padding: '1rem', color: '#303972' }}>{record.time}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'danger' : 'warning'}`}
                                                style={{
                                                    background: record.status === 'Present' ? '#E6F9F0' : record.status === 'Absent' ? '#FEECEC' : '#FFF4E5',
                                                    color: record.status === 'Present' ? '#00B69B' : record.status === 'Absent' ? '#EE3636' : '#FFA756',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '40px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grades Table */}
            {activeTab === 'grades' && (
                <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="simple-table" style={{ width: '100%', padding: '0 1rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Student</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Subject</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Assessment</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrades.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#303972' }}>{record.studentName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#A098AE' }}>{record.studentId}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#303972' }}>{record.subjectName}</td>
                                        <td style={{ padding: '1rem', color: '#303972' }}>{record.title}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                textTransform: 'capitalize',
                                                background: '#F3F4FF',
                                                color: 'var(--primary-color)',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem'
                                            }}>
                                                {record.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#A098AE' }}>{record.date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '6px',
                                                    background: '#eee',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${record.percentage}%`,
                                                        height: '100%',
                                                        background: record.percentage >= 80 ? '#00B69B' : record.percentage >= 60 ? '#FFA756' : '#EE3636'
                                                    }}></div>
                                                </div>
                                                <span style={{ fontWeight: 'bold', color: '#303972' }}>{record.percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
