import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Phone, Mail, Download, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { dataIntegrityService } from '../../services/dataIntegrityService';
import { useRefresh } from '../../context/RefreshContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../config/permissions';
import TableSkeleton from '../../components/common/TableSkeleton';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import DeleteWarningModal from '../../components/common/DeleteWarningModal';
import AddEditStudent from './AddEditStudent';
import './StudentsList.css';

const ITEMS_PER_PAGE = 5;

export default function StudentsList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();
    const { hasPermission } = useAuth();

    const canDeleteStudent = hasPermission(PERMISSIONS.DELETE_STUDENT);

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

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deleteDependencies, setDeleteDependencies] = useState(null);
    const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
    const [forceDeleteError, setForceDeleteError] = useState(null);

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

    const handleDeleteStudent = useCallback(async (student, e) => {
        e.stopPropagation();
        if (!canDeleteStudent) {
            alert('You do not have permission to delete students.');
            return;
        }

        setStudentToDelete(student);
        setDeleteDependencies(null);

        try {
            // Check dependencies first
            const [attendance, evaluations] = await Promise.all([
                api.client.get(`/attendance/student/${student.id}`),
                api.client.get('/evaluations', { params: { studentId: student.id } })
            ]);

            const dependencies = {
                attendance: attendance.data?.length || 0,
                evaluations: evaluations.data?.length || 0
            };

            const totalDeps = dependencies.attendance + dependencies.evaluations;

            if (totalDeps > 0) {
                setDeleteDependencies(dependencies);
                setForceDeleteError(null);
                setShowDeleteWarning(true);
            } else {
                setShowDeleteModal(true);
            }
        } catch (err) {
            console.error('Failed to check dependencies:', err);
            // Proceed with delete confirmation anyway
            setShowDeleteModal(true);
        }
    }, [canDeleteStudent]);

    const confirmDeleteStudent = useCallback(async () => {
        if (!studentToDelete) return;

        try {
            await api.deleteStudent(studentToDelete.id);
            setStudents(students.filter(s => s.id !== studentToDelete.id));
            setShowDeleteModal(false);
            setStudentToDelete(null);
        } catch (err) {
            console.error('Failed to delete student:', err);
            setShowDeleteModal(false);

            if (err.response?.status === 409) {
                setShowDeleteWarning(true);
            } else {
                alert(err.message || 'Failed to delete student');
                setStudentToDelete(null);
            }
        }
    }, [studentToDelete, students]);

    const handleForceDelete = useCallback(async () => {
        if (!studentToDelete) return;

        setForceDeleteError(null);
        setForceDeleteLoading(true);

        try {
            await api.client.delete(`/students/${studentToDelete.id}/force`);
            setStudents(students.filter(s => s.id !== studentToDelete.id));
            setShowDeleteWarning(false);
            setStudentToDelete(null);
            setDeleteDependencies(null);
        } catch (forceErr) {
            console.error('Force delete failed:', forceErr);
            setForceDeleteError(forceErr.response?.data?.message || forceErr.message || 'Force delete failed');
        } finally {
            setForceDeleteLoading(false);
        }
    }, [studentToDelete, students]);

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
                                                {canDeleteStudent && (
                                                    <button
                                                        className="icon-btn-sm btn-delete"
                                                        onClick={(e) => handleDeleteStudent(student, e)}
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Student"
                message={`Are you sure you want to delete "${studentToDelete?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteStudent}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                }}
                variant="danger"
            />

            {/* Delete Warning Modal (when dependencies exist) */}
            <DeleteWarningModal
                isOpen={showDeleteWarning}
                entityType="student"
                entityName={studentToDelete?.name}
                dependencies={deleteDependencies}
                onCancel={() => {
                    setShowDeleteWarning(false);
                    setStudentToDelete(null);
                    setDeleteDependencies(null);
                    setForceDeleteError(null);
                }}
                onForceDelete={handleForceDelete}
                isForceDeleting={forceDeleteLoading}
                forceError={forceDeleteError}
            />
        </section>
    );
}
