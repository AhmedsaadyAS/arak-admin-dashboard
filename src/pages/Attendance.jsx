import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronDown, 
    Calendar as CalendarIcon, 
    Search,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Edit2,
    Check
} from 'lucide-react';
import { api } from '../services/api';
import TableSkeleton from '../components/common/TableSkeleton';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import AttendanceEditModal from '../components/attendance/AttendanceEditModal';
import './Attendance.css';

const ITEMS_PER_PAGE = 30;

export default function Attendance() {
    const navigate = useNavigate();
    
    // --- Filters State ---
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    
    // --- Data State ---
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [summary, setSummary] = useState({
        totalStudents: 0,
        presentCount: 0,
        presentRate: 0,
        absentCount: 0,
        absentRate: 0,
        lateCount: 0,
        lateRate: 0,
        notRecordedCount: 0
    });

    // --- Modal State ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    // --- Initialization ---
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [gradesData, classesData] = await Promise.all([
                    api.getClasses(), // We use classes to derive grades if needed, or specific grades API
                    api.getAttendanceSummary(classFilter, dateFilter)
                ]);
                
                // Extract unique grades
                const uniqueGrades = [...new Set(gradesData.map(c => c.grade))];
                setGrades(uniqueGrades);
                setClasses(classesData);
            } catch (err) {
                console.error("Failed to load filters", err);
            }
        };
        fetchFilters();
    }, []);

    // Fetch attendance data and summary
    const fetchData = useCallback(async () => {
        if (!classFilter) return;

        try {
            setLoading(true);
            setError(null);
            
            const [listResponse, summaryData] = await Promise.all([
                api.getAttendanceByClass(classFilter, dateFilter),
                api.getAttendanceSummary(classFilter, dateFilter)
            ]);

            setAttendanceData(listResponse.data);
            setTotalItems(listResponse.total);
            setSummary(summaryData);
        } catch (err) {
            setError("Failed to load attendance data.");
        } finally {
            setLoading(false);
        }
    }, [classFilter, dateFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Computed Stats ---
    // (Backend summary used instead of local computation)

    // --- Handlers ---
    const handleUpdateRecord = async (updatedData) => {
        try {
            if (currentRecord.id === 0) {
                // Post new record (MarkAttendance)
                await api.markAttendance({
                    studentId: currentRecord.studentId,
                    date: dateFilter,
                    ...updatedData
                });
            } else {
                // Update existing
                await api.updateAttendance(currentRecord.id, updatedData);
            }
            setShowEditModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to update record");
        }
    };

    const handleBulkMarkPresent = async () => {
        try {
            const payload = {
                classId: parseInt(classFilter, 10),
                date: dateFilter,
                session: "Morning",
                records: attendanceData.map(s => ({
                    studentId: s.studentId,
                    status: "Present",
                    timeIn: "08:00:00"
                }))
            };
            await api.bulkMarkAttendance(payload);
            setShowBulkConfirm(false);
            fetchData();
        } catch (err) {
            alert("Bulk update failed");
        }
    };

    const filteredClasses = classes.filter(c => !selectedGrade || c.grade === selectedGrade);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Present': return 'badge-present';
            case 'Absent': return 'badge-absent';
            case 'Late': return 'badge-late';
            case 'NotRecorded': return 'badge-notrecorded';
            default: return 'badge-notrecorded';
        }
    };

    return (
        <div className="attendance-container animate-fade-in">
            <div className="attendance-header">
                <h3>Daily Attendance</h3>
                <p>Monitor and manage student presence across classes</p>
            </div>

            {/* Filters Bar */}
            <div className="attendance-filters">
                <div className="filter-item">
                    <label>Grade</label>
                    <div className="select-container">
                        <select 
                            value={selectedGrade} 
                            onChange={(e) => {
                                setSelectedGrade(e.target.value);
                                setClassFilter(''); // Reset class on grade change
                            }}
                        >
                            <option value="">All Grades</option>
                            {grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="dropdown-icon" size={16} />
                    </div>
                </div>

                <div className="filter-item">
                    <label>Class</label>
                    <div className="select-container">
                        <select 
                            value={classFilter} 
                            onChange={(e) => setClassFilter(e.target.value)}
                            disabled={!selectedGrade}
                        >
                            <option value="">Select Class</option>
                            {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="dropdown-icon" size={16} />
                    </div>
                </div>

                <div className="filter-item">
                    <label>Date</label>
                    <div className="input-container">
                        <input 
                            type="date" 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)} 
                        />
                        <CalendarIcon className="calendar-icon" size={16} />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="attendance-stats-row">
                <div className="att-stat-card total">
                    <div className="card-icon"><Users size={22} /></div>
                    <div className="card-data">
                        <span className="card-label">Total Students</span>
                        <h4 className="card-value">{summary.totalStudents}</h4>
                        <span className="card-subtext">Class Size</span>
                    </div>
                </div>
                <div className="att-stat-card present">
                    <div className="card-icon"><CheckCircle2 size={22} /></div>
                    <div className="card-data">
                        <span className="card-label">Present</span>
                        <h4 className="card-value">{summary.presentCount}</h4>
                        <span className="card-subtext">{summary.presentRate.toFixed(0)}% rate</span>
                    </div>
                </div>
                <div className="att-stat-card absent">
                    <div className="card-icon"><XCircle size={22} /></div>
                    <div className="card-data">
                        <span className="card-label">Absent</span>
                        <h4 className="card-value">{summary.absentCount}</h4>
                        <span className="card-subtext">{summary.absentRate.toFixed(0)}% rate</span>
                    </div>
                </div>
                <div className="att-stat-card late">
                    <div className="card-icon"><Clock size={22} /></div>
                    <div className="card-data">
                        <span className="card-label">Late</span>
                        <h4 className="card-value">{summary.lateCount}</h4>
                        <span className="card-subtext">{summary.lateRate.toFixed(0)}% rate</span>
                    </div>
                </div>
            </div>

            {/* Table Control Bar */}
            <div className="table-controls">
                <h3>Students List</h3>
                <button 
                    className="bulk-present-btn"
                    disabled={!classFilter || loading || attendanceData.length === 0}
                    onClick={() => setShowBulkConfirm(true)}
                >
                    <Check size={18} />
                    Mark All Present
                </button>
            </div>

            {/* Attendance Table */}
            <div className="table-wrapper">
                {loading ? (
                    <TableSkeleton rows={10} />
                ) : error ? (
                    <div className="att-error">
                        <p>{error}</p>
                        <button onClick={fetchAttendance}>Retry</button>
                    </div>
                ) : !classFilter ? (
                    <div className="att-placeholder">
                        <Users size={48} />
                        <p>Select a class and date to view attendance data</p>
                    </div>
                ) : (
                    <>
                        <table className="att-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Time In</th>
                                    <th>Time Out</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.length > 0 ? (
                                    attendanceData.map((row, idx) => (
                                        <tr key={row.studentId}>
                                            <td className="row-num">{idx + 1 + (page - 1) * ITEMS_PER_PAGE}</td>
                                            <td 
                                                className="student-name-link"
                                                onClick={() => navigate(`/attendance/student/${row.studentId}`)}
                                            >
                                                <div className="name-with-avatar">
                                                    <div className="mini-avatar">{row.studentName.charAt(0)}</div>
                                                    <span>{row.studentName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td>{row.timeIn ? row.timeIn.substring(0, 5) : '--'}</td>
                                            <td>{row.timeOut ? row.timeOut.substring(0, 5) : '--'}</td>
                                            <td>
                                                <button 
                                                    className="row-edit-btn"
                                                    onClick={() => {
                                                        setCurrentRecord(row);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">No students found in this class.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {totalItems > ITEMS_PER_PAGE && (
                            <Pagination 
                                currentPage={page}
                                totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)}
                                totalItems={totalItems}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Inline Modals */}
            {showEditModal && (
                <AttendanceEditModal 
                    record={currentRecord}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleUpdateRecord}
                />
            )}

            <ConfirmModal 
                isOpen={showBulkConfirm}
                title="Mark All Present"
                message={`Mark all ${attendanceData.length} students as Present for ${dateFilter}? This will overwrite any existing records.`}
                onConfirm={handleBulkMarkPresent}
                onCancel={() => setShowBulkConfirm(false)}
                variant="info"
            />
        </div>
    );
}
