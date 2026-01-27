import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Award, TrendingUp } from 'lucide-react';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import GradeChart from './GradeChart';
import { evaluationService } from '../../services/evaluationService';
import { api } from '../../services/api';
import './GradebookMonitor.css';

export default function GradebookMonitor() {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.client.get('/classes');
                setClasses(response.data || []);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }, []);

    // Fetch grades when class and subject are selected
    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchGrades();
        }
    }, [selectedClass, selectedSubject]);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            // Fetch students in the selected class
            const studentsResponse = await api.getStudents({ classId: selectedClass });
            setStudents(studentsResponse);

            // Fetch evaluations for the class and subject
            const gradesResponse = await evaluationService.getClassGrades(selectedClass, selectedSubject);
            setGrades(gradesResponse || []);
        } catch (error) {
            console.error("Failed to fetch grades", error);
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLockToggle = async () => {
        try {
            const newLockStatus = !isLocked;
            await evaluationService.setGradeLockStatus(selectedClass, newLockStatus);
            setIsLocked(newLockStatus);
        } catch (error) {
            console.error("Failed to toggle lock status", error);
        }
    };

    const handleClearFilters = () => {
        setSelectedClass('');
        setSelectedSubject('');
        setGrades([]);
        setStudents([]);
    };

    // Define subjects (in real app, fetch from API or config)
    const subjectOptions = [
        { value: 'Math', label: 'Mathematics' },
        { value: 'Science', label: 'Science' },
        { value: 'English', label: 'English' },
        { value: 'History', label: 'History' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Arts', label: 'Arts' }
    ];

    // Prepare table data
    const tableData = students.map(student => {
        const grade = grades.find(g => g.studentId === student.id);
        return {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            marks: grade?.marks || 'N/A',
            feedback: grade?.feedback || '-',
            date: grade?.date || '-'
        };
    });

    // Define table columns
    const columns = [
        { key: 'studentId', label: 'Student ID', sortable: true },
        { key: 'name', label: 'Student Name', sortable: true },
        {
            key: 'marks',
            label: 'Marks',
            sortable: true,
            render: (marks) => {
                if (marks === 'N/A') return <span style={{ color: '#9CA3AF' }}>N/A</span>;
                const gradeColor = marks >= 80 ? '#22C55E' : marks >= 60 ? '#F59E0B' : '#EF4444';
                return <span style={{ color: gradeColor, fontWeight: '600' }}>{marks}/100</span>;
            }
        },
        { key: 'feedback', label: 'Teacher Feedback', sortable: false },
        { key: 'date', label: 'Date', sortable: true }
    ];

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
                {selectedClass && selectedSubject && (
                    <button
                        className={`lock-btn ${isLocked ? 'locked' : 'unlocked'}`}
                        onClick={handleLockToggle}
                        title={isLocked ? 'Unlock grades for editing' : 'Lock grades to prevent editing'}
                    >
                        {isLocked ? (
                            <>
                                <Lock size={18} />
                                Grades Locked
                            </>
                        ) : (
                            <>
                                <Unlock size={18} />
                                Grades Unlocked
                            </>
                        )}
                    </button>
                )}
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
                        options: subjectOptions
                    }
                ]}
                onClear={handleClearFilters}
            />

            {/* Content */}
            {loading ? (
                <SkeletonLoader variant="table" rows={5} />
            ) : selectedClass && selectedSubject ? (
                <div className="gradebook-content">
                    {/* Grade Chart */}
                    <GradeChart grades={grades} />

                    {/* Grade Table */}
                    <div className="grade-table-card">
                        <div className="card-header-row">
                            <h3>Class Performance - {classes.find(c => c.id === parseInt(selectedClass))?.name} ({selectedSubject})</h3>
                            <div className="stats-badges">
                                <span className="stat-badge">
                                    <TrendingUp size={16} />
                                    Avg: {grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.marks, 0) / grades.length) : 0}%
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
