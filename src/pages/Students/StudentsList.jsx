import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Phone, Mail, Download, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { dataIntegrityService } from '../../services/dataIntegrityService';
import { useRefresh } from '../../context/RefreshContext';
import TableSkeleton from '../../components/common/TableSkeleton';
import Pagination from '../../components/common/Pagination';
import AddEditStudent from './AddEditStudent';
import './StudentsList.css';

const ITEMS_PER_PAGE = 5;

export default function StudentsList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Data State
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    /**
     * Fetch Students from API with Server-Side Pagination
     * Uses json-server pagination: _page and _limit params
     * Extracts total count from X-Total-Count header
     */
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                _page: page,
                _limit: ITEMS_PER_PAGE,
            };

            // Apply Filters to API Params
            if (searchTerm) params.q = searchTerm;
            if (gradeFilter !== 'All') params.grade = gradeFilter;
            if (statusFilter !== 'All') params.status = statusFilter;

            // Make the Request
            const { data, total } = await api.getStudents(params);

            setStudents(data);
            setTotalStudents(total);
        } catch (err) {
            console.error("Failed to fetch students:", err);
            setError(`Failed to load students data: ${err.message || err.toString()}`);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, gradeFilter, statusFilter]);

    // Fetch data when dependencies change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchStudents, refreshKey]);

    // Fetch classes for filter dropdown
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classes = await api.getClasses();
                setClasses(classes || []);
            } catch (error) {
                console.error('Failed to fetch classes:', error);
            }
        };
        fetchClasses();
    }, []);

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleAddStudent = useCallback(() => {
        setCurrentStudent(null);
        setIsEditing(true);
    }, []);

    const handleEditStudent = useCallback((student, e) => {
        e.stopPropagation();
        setCurrentStudent(student);
        setIsEditing(true);
    }, []);

    const handleSaveStudent = useCallback(async (studentData) => {
        try {
            // Ensure all required fields are present
            const completeData = {
                ...studentData,
                // Ensure className is set if classId exists (may come from form)
                className: studentData.className || studentData.grade || '',
                email: studentData.email || '',
                status: studentData.status || 'Active'
            };

            let savedStudent;
            const oldParentId = currentStudent?.parentId || null;

            if (currentStudent) {
                savedStudent = await api.updateStudent(currentStudent.id, completeData);
            } else {
                savedStudent = await api.createStudent(completeData);
            }

            // Sync: keep parent's linkedStudents in sync
            await dataIntegrityService.syncStudentToParent(savedStudent, oldParentId);

            setIsEditing(false);
            setCurrentStudent(null);
            fetchStudents(false); // Reload list
        } catch (err) {
            console.error('Failed to save student:', err);
            alert("Failed to save student");
        }
    }, [currentStudent, fetchStudents]);

    const handleCall = useCallback((studentName, e) => {
        e.stopPropagation();
        alert(`Calling parent of ${studentName}...`);
    }, []);

    const handleEmail = useCallback((studentName, e) => {
        e.stopPropagation();
        alert(`Opening email to parent of ${studentName}...`);
    }, []);

    const handleExport = useCallback(() => {
        alert(`Exporting ${totalStudents} students to CSV...`);
    }, [totalStudents]);

    const handleViewDetails = useCallback((id) => {
        navigate(`/students/${id}`);
    }, [navigate]);

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
                        placeholder="Search by name, email..."
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
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
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

            {/* Results Counter & Stats */}
            <div className="results-counter">
                <span>Showing <strong>{students.length}</strong> of <strong>{totalStudents}</strong> students</span>
            </div>

            {/* Table or Loading */}
            {loading && students.length === 0 ? (
                <TableSkeleton rows={ITEMS_PER_PAGE} />
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="table-container">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Parent</th>
                                <th>Grade</th>
                                <th>City</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
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
                                        <td style={{ color: '#303972' }}>{student.city || student.address?.split(',')[0] || '-'}</td>
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
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-icon">
                                                <Search size={30} />
                                            </div>
                                            <h3>No Students Found</h3>
                                            <p>Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {!loading && students.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalStudents / ITEMS_PER_PAGE)}
                            totalItems={totalStudents}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    )}
                </div>
            )}
        </section>
    );
}
