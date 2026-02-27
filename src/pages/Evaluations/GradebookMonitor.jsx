import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, Award, TrendingUp, Download, FileText, ArrowUpRight, ArrowDownRight, Users, BarChart3 } from 'lucide-react';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import GradeChart from './GradeChart';
import { api } from '../../services/api';
import './GradebookMonitor.css';

// ─── Helpers ──────────────────────────────────────────
function getLetterGrade(pct) {
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
}

function getGradeColor(pct) {
    if (pct >= 80) return '#22C55E';
    if (pct >= 60) return '#F59E0B';
    return '#EF4444';
}

function downloadCSV(rows, filename) {
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => {
            const val = String(row[h] ?? '').replace(/"/g, '""');
            return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
        }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ─── Component ────────────────────────────────────────
export default function GradebookMonitor() {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Fetch classes and subjects in parallel on mount
    useEffect(() => {
        const fetchInit = async () => {
            try {
                const [classesRes, subjectsRes] = await Promise.all([
                    api.client.get('/classes'),
                    api.client.get('/subjects'),
                ]);
                setClasses(classesRes.data || []);
                setSubjects(subjectsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            }
        };
        fetchInit();
    }, []);

    // Fetch grades when class AND subject are both selected
    // Depend on `subjects` too so we wait until the lookup can succeed
    useEffect(() => {
        if (selectedClass && selectedSubject && subjects.length > 0) {
            fetchGrades(selectedClass, selectedSubject);
        }
    }, [selectedClass, selectedSubject, subjects]);

    const fetchGrades = async (classId, subjectId) => {
        setLoading(true);
        try {
            // Fetch students and evaluations in parallel
            const [studentsResponse, gradesResponse] = await Promise.all([
                api.getStudents({ classId }),
                api.client.get('/evaluations', {
                    params: {
                        classId: parseInt(classId, 10),
                        subjectId: parseInt(subjectId, 10),
                    }
                })
            ]);

            const studentList = studentsResponse?.data || [];
            setStudents(studentList);

            // Aggregate: SUM all grade-column evaluations per student.
            // Each upload creates one evaluation per grade column (Month1, Final, etc.)
            // so SUM(marks) = total score, SUM(maxMarks) = total possible.
            // We also compute a normalized percentage (0-100) for letter grades & stats.
            const rawGrades = Array.isArray(gradesResponse.data)
                ? gradesResponse.data
                : gradesResponse.data?.data || [];
            const aggregated = studentList.map(student => {
                const evals = rawGrades.filter(
                    g => String(g.studentId) === String(student.id)
                );
                if (evals.length === 0) return null;
                const totalMarks = evals.reduce((sum, g) => sum + (g.marks || 0), 0);
                const totalMax = evals.reduce((sum, g) => sum + (g.maxMarks || 0), 0) || 100;
                const pct = Math.round((totalMarks / totalMax) * 100);
                return {
                    studentId: student.id,
                    marks: totalMarks,
                    maxMarks: totalMax,
                    pct,               // normalized 0–100 for letter grades & stats
                    feedback: evals[evals.length - 1]?.feedback || '-',
                    date: evals[evals.length - 1]?.date || '-',
                };
            }).filter(Boolean);

            setGrades(aggregated);
        } catch (error) {
            console.error('Failed to fetch grades', error);
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLockToggle = async () => {
        try {
            const newLockStatus = !isLocked;
            await api.client.patch(`/classes/${selectedClass}`, { gradesLocked: newLockStatus });
            setIsLocked(newLockStatus);
        } catch (error) {
            console.error('Failed to toggle lock status', error);
        }
    };

    const handleClearFilters = () => {
        setSelectedClass('');
        setSelectedSubject('');
        setGrades([]);
        setStudents([]);
    };

    // ─── Derived Data ─────────────────────────────────
    const resolvedClassName = useMemo(() =>
        classes.find(c => String(c.id) === String(selectedClass))?.name || '',
        [classes, selectedClass]
    );
    const resolvedSubjectName = useMemo(() =>
        subjects.find(s => String(s.id) === String(selectedSubject))?.name || '',
        [subjects, selectedSubject]
    );

    const tableData = useMemo(() => students.map(student => {
        const grade = grades.find(g => String(g.studentId) === String(student.id));
        return {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            marks: grade?.marks ?? 'N/A',
            maxMarks: grade?.maxMarks || 100,
            pct: grade?.pct ?? null,
            letter: grade?.pct != null ? getLetterGrade(grade.pct) : '-',
            feedback: grade?.feedback || '-',
            date: grade?.date || '-'
        };
    }), [students, grades]);

    // Summary statistics
    const stats = useMemo(() => {
        const scored = tableData.filter(r => r.pct != null);
        if (scored.length === 0) return null;
        const pcts = scored.map(r => r.pct);
        const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
        const highest = Math.max(...pcts);
        const lowest = Math.min(...pcts);
        const passRate = Math.round((pcts.filter(p => p >= 60).length / pcts.length) * 100);
        return { avg, highest, lowest, passRate, evaluated: scored.length, total: tableData.length };
    }, [tableData]);

    // ─── Export: Class Grades CSV ──────────────────────
    const handleExportClassCSV = () => {
        if (tableData.length === 0) return;
        const rows = tableData.map(r => ({
            'Student ID': r.studentId,
            'Student Name': r.name,
            'Marks': r.marks,
            'Grade': r.letter,
            'Feedback': r.feedback,
            'Date': r.date
        }));
        downloadCSV(rows, `${resolvedClassName}_${resolvedSubjectName}_Grades.csv`);
    };

    // ─── Export: Individual Student Report ─────────────
    const handleExportStudentReport = async (student) => {
        try {
            // Fetch all evaluations for this student
            const res = await api.client.get('/evaluations', { params: { studentId: parseInt(student.id, 10) } });
            const allGrades = Array.isArray(res.data) ? res.data : res.data?.data || [];
            if (!allGrades || allGrades.length === 0) {
                alert(`No grades found for ${student.name}`);
                return;
            }
            const rows = allGrades.map(g => ({
                'Student ID': student.studentId,
                'Student Name': student.name,
                'Subject': g.subject || subjects.find(s => String(s.id) === String(g.subjectId))?.name || 'N/A',
                'Marks': g.marks,
                'Grade': getLetterGrade(g.marks),
                'Feedback': g.feedback || '-',
                'Date': g.date || '-'
            }));
            downloadCSV(rows, `${student.name.replace(/\s+/g, '_')}_Report_Card.csv`);
        } catch (err) {
            console.error('Failed to export student report:', err);
            alert('Failed to export. Please try again.');
        }
    };

    // ─── Table Columns ────────────────────────────────
    const columns = [
        { key: 'studentId', label: 'Student ID', sortable: true },
        { key: 'name', label: 'Student Name', sortable: true },
        {
            key: 'marks',
            label: 'Marks',
            sortable: true,
            render: (marks, row) => {
                if (marks === 'N/A') return <span className="grade-badge grade-na">N/A</span>;
                const pct = row.pct ?? 0;
                return (
                    <span className="grade-badge" style={{ background: `${getGradeColor(pct)}15`, color: getGradeColor(pct) }}>
                        {marks}/{row.maxMarks || 100}
                    </span>
                );
            }
        },
        {
            key: 'letter',
            label: 'Grade',
            sortable: true,
            render: (letter, row) => {
                if (letter === '-') return <span style={{ color: '#9CA3AF' }}>-</span>;
                const pct = row.pct ?? 0;
                return (
                    <span className="letter-badge" style={{ background: getGradeColor(pct), color: 'white' }}>
                        {letter}
                    </span>
                );
            }
        },
        { key: 'feedback', label: 'Feedback', sortable: false },
        { key: 'date', label: 'Date', sortable: true },
        {
            key: 'export',
            label: '',
            sortable: false,
            render: (_val, row) => (
                <button
                    className="export-row-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        const student = students.find(s => String(s.id) === String(row.id));
                        if (student) handleExportStudentReport({ ...student, studentId: row.studentId });
                    }}
                    title={`Export ${row.name}'s report card`}
                >
                    <FileText size={14} />
                    Report
                </button>
            )
        }
    ];

    // ─── Render ───────────────────────────────────────
    return (
        <div className="gradebook-monitor">
            {/* Header */}
            <div className="gradebook-header">
                <div className="header-left">
                    <Award size={32} className="header-icon" />
                    <div>
                        <h2>Gradebook Monitor</h2>
                        <p>Admin oversight for student evaluation and grade management</p>
                    </div>
                </div>
                <div className="header-actions">
                    {selectedClass && selectedSubject && (
                        <>
                            <button
                                className="export-btn"
                                onClick={handleExportClassCSV}
                                title="Export class grades as CSV"
                            >
                                <Download size={18} />
                                Export CSV
                            </button>
                            <button
                                className={`lock-btn ${isLocked ? 'locked' : 'unlocked'}`}
                                onClick={handleLockToggle}
                                title={isLocked ? 'Unlock grades for editing' : 'Lock grades to prevent editing'}
                            >
                                {isLocked ? (
                                    <><Lock size={18} /> Locked</>
                                ) : (
                                    <><Unlock size={18} /> Unlocked</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <FilterBar
                filters={[
                    {
                        key: 'class',
                        label: 'Class',
                        value: selectedClass,
                        onChange: setSelectedClass,
                        options: classes.map(c => ({ value: c.id, label: c.name }))
                    },
                    {
                        key: 'subject',
                        label: 'Subject',
                        value: selectedSubject,
                        onChange: setSelectedSubject,
                        options: subjects.map(s => ({ value: s.id, label: s.name }))
                    }
                ]}
                onClear={handleClearFilters}
            />

            {/* Content */}
            {loading ? (
                <SkeletonLoader variant="table" rows={5} />
            ) : selectedClass && selectedSubject ? (
                <div className="gradebook-content">
                    {/* Summary Stat Cards */}
                    {stats && (
                        <div className="stats-grid">
                            <div className="summary-card">
                                <div className="summary-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                                    <BarChart3 size={22} />
                                </div>
                                <div className="summary-info">
                                    <span className="summary-value">{stats.avg}%</span>
                                    <span className="summary-label">Class Average</span>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon" style={{ background: '#F0FDF4', color: '#22C55E' }}>
                                    <ArrowUpRight size={22} />
                                </div>
                                <div className="summary-info">
                                    <span className="summary-value">{stats.highest}%</span>
                                    <span className="summary-label">Highest Score</span>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                                    <ArrowDownRight size={22} />
                                </div>
                                <div className="summary-info">
                                    <span className="summary-value">{stats.lowest}%</span>
                                    <span className="summary-label">Lowest Score</span>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
                                    <Users size={22} />
                                </div>
                                <div className="summary-info">
                                    <span className="summary-value">{stats.passRate}%</span>
                                    <span className="summary-label">Pass Rate ({stats.evaluated}/{stats.total})</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grade Chart */}
                    <GradeChart grades={grades} />

                    {/* Grade Table */}
                    <div className="grade-table-card">
                        <div className="card-header-row">
                            <h3>Class Performance — {resolvedClassName} ({resolvedSubjectName})</h3>
                            <div className="stats-badges">
                                <span className="stat-badge">
                                    <TrendingUp size={16} />
                                    Avg: {stats?.avg || 0}%
                                </span>
                                <span className="stat-badge">
                                    Students: {students.length}
                                </span>
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={tableData}
                            showActions={false}
                            emptyMessage="No grades recorded for this class and subject"
                        />
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <Award size={64} className="empty-icon" />
                    <h3>Select Class and Subject</h3>
                    <p>Choose a class and subject from the filters above to view student grades</p>
                </div>
            )}
        </div>
    );
}
