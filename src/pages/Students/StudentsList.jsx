import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Download, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useRefresh } from '../../context/RefreshContext';
import TableSkeleton from '../../components/common/TableSkeleton';
import AddEditStudent from './AddEditStudent';
import './StudentsList.css';

export default function StudentsList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');

    // Data State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Fetch Data
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const data = await api.getStudents();
                setStudents(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch students:", err);
                setError("Failed to load students data.");
            } finally {
                // Add a small delay for smoother transition/skeleton visibility
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchStudents();
    }, [refreshKey]);

    // Get unique grades for filter
    const uniqueGrades = useMemo(() => {
        const grades = students.map(s => s.grade);
        return [...new Set(grades)].sort();
    }, [students]);

    // Advanced filtering
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const name = student.name?.toLowerCase() || '';
            const email = student.email?.toLowerCase() || '';
            const parentName = student.parentName?.toLowerCase() || '';
            const studentId = student.studentId?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch = searchTerm === '' ||
                name.includes(searchLower) ||
                email.includes(searchLower) ||
                parentName.includes(searchLower) ||
                studentId.includes(searchLower);

            const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;
            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Active' && !student.inactive) ||
                (statusFilter === 'Inactive' && student.inactive);
            const matchesGender = genderFilter === 'All' || student.gender === genderFilter;

            return matchesSearch && matchesGrade && matchesStatus && matchesGender;
        });
    }, [students, searchTerm, gradeFilter, statusFilter, genderFilter]);

    const handleAddStudent = () => {
        setCurrentStudent(null);
        setIsEditing(true);
    };

    const handleEditStudent = (student, e) => {
        e.stopPropagation();
        setCurrentStudent(student);
        setIsEditing(true);
    };

    const handleSaveStudent = (studentData) => {
        if (currentStudent) {
            setStudents(students.map(s => s.id === currentStudent.id ? { ...s, ...studentData } : s));
        } else {
            const newStudent = {
                id: students.length + 1,
                enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                ...studentData
            };
            setStudents([newStudent, ...students]);
        }
        setIsEditing(false);
        setCurrentStudent(null);
    };

    const handleCall = (studentName, e) => {
        e.stopPropagation();
        alert(`Calling parent of ${studentName}...`);
    };

    const handleEmail = (studentName, e) => {
        e.stopPropagation();
        alert(`Opening email to parent of ${studentName}...`);
    };

    const handleExport = () => {
        alert(`Exporting ${filteredStudents.length} students to CSV...`);
    };

    const handleViewDetails = (id) => {
        navigate(`/students/${id}`);
    };

    if (isEditing) {
        return (
            <AddEditStudent
                student={currentStudent}
                onBack={() => {
                    setIsEditing(false);
                    setCurrentStudent(null);
                }}
                onSave={handleSaveStudent}
            />
        );
    }

    if (loading) return <TableSkeleton rows={8} />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <section className="students-list-container animate-fade-in">
            <header className="students-header">
                <h3>Students</h3>
            </header>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-container">
                    <Search size={20} className="search-icon-absolute" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email, parent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                >
                    <option value="All">All Grades</option>
                    {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <button className="action-btn btn-outline" onClick={handleExport}>
                    <Download size={18} />
                    Export
                </button>

                <button className="action-btn btn-primary" onClick={handleAddStudent}>
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            {/* Results Counter */}
            <div className="results-counter">
                <span>Showing <strong>{filteredStudents.length}</strong> of {students.length} students</span>
                {(searchTerm || gradeFilter !== 'All' || genderFilter !== 'All' || statusFilter !== 'All') && (
                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setGradeFilter('All');
                            setGenderFilter('All');
                            setStatusFilter('All');
                        }}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Students Table */}
            <div className="table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Parent</th>
                            <th>Grade</th>
                            <th>Gender</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.id}
                                    onClick={() => handleViewDetails(student.id)}
                                    className="student-row"
                                >
                                    <td>
                                        <span className="student-id">{student.studentId}</span>
                                    </td>
                                    <td>
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="student-details">
                                                <h4>{student.name}</h4>
                                                <span>{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#303972', fontWeight: '500' }}>{student.parentName}</td>
                                    <td>
                                        <span className="grade-badge">{student.grade}</span>
                                    </td>
                                    <td style={{ color: '#303972' }}>{student.gender}</td>
                                    <td style={{ color: '#303972' }}>{student.city}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleCall(student.name, e)}
                                                title="Call Parent"
                                            >
                                                <Phone size={18} />
                                            </button>
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleEmail(student.name, e)}
                                                title="Email Parent"
                                            >
                                                <Mail size={18} />
                                            </button>
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleEditStudent(student, e)}
                                                title="Edit Student"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <Search size={30} />
                                        </div>
                                        <h3>No Students Found</h3>
                                        <p>
                                            We couldn't find any students matching your search.
                                            <br />Try adjusting your filters or search terms.
                                        </p>
                                        <button
                                            className="action-btn btn-primary"
                                            style={{ marginTop: '0.5rem', width: 'auto' }}
                                            onClick={() => {
                                                setSearchTerm('');
                                                setGradeFilter('All');
                                                setGenderFilter('All');
                                                setStatusFilter('All');
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
