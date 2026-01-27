import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Phone, Mail, Download, Edit2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useRefresh } from '../../context/RefreshContext';
import TableSkeleton from '../../components/common/TableSkeleton';
import AddEditStudent from './AddEditStudent';
import './StudentsList.css';

const ITEMS_PER_PAGE = 5;

export default function StudentsList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();

    // Search & Filter State
    // We use a separate state for the debounced/active search term to prevent rapid API calls
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Data State
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    /**
     * Fetch Students from API
     * Handles both initial load (page 1) and "Load More" (page > 1)
     */
    const fetchStudents = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const params = {
                _page: isLoadMore ? page + 1 : 1, // Calculate next page if loading more
                _limit: ITEMS_PER_PAGE,
            };

            // Apply Filters to API Params
            if (searchTerm) params.q = searchTerm;
            if (gradeFilter !== 'All') params.grade = gradeFilter;
            // JSON Server expects 'Active'/'Inactive' matching the string in db
            if (statusFilter !== 'All') params.status = statusFilter;

            // Make the Request
            const { data, total } = await api.getStudents(params);

            if (isLoadMore) {
                setStudents(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            } else {
                setStudents(data);
                setPage(1);
            }

            setTotalStudents(total);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch students:", err);
            setError("Failed to load students data.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page, searchTerm, gradeFilter, statusFilter]);

    // Initial Load & Filter Changes
    // When filters change, we reset to Page 1
    useEffect(() => {
        // Debounce search a tiny bit or just run effect
        const timer = setTimeout(() => {
            fetchStudents(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, gradeFilter, statusFilter, refreshKey]);

    const handleLoadMore = () => {
        fetchStudents(true);
    };

    const handleAddStudent = () => {
        setCurrentStudent(null);
        setIsEditing(true);
    };

    const handleEditStudent = (student, e) => {
        e.stopPropagation();
        setCurrentStudent(student);
        setIsEditing(true);
    };

    const handleSaveStudent = async (studentData) => {
        try {
            if (currentStudent) {
                await api.updateStudent(currentStudent.id, studentData);
            } else {
                await api.createStudent(studentData);
            }
            setIsEditing(false);
            setCurrentStudent(null);
            fetchStudents(false); // Reload list
        } catch (err) {
            alert("Failed to save student");
        }
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
        alert(`Exporting ${totalStudents} students to CSV...`);
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

    const hasMore = students.length < totalStudents;

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
                    <option value="VII A">VII A</option>
                    <option value="VII B">VII B</option>
                    <option value="VII C">VII C</option>
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
                                        <td style={{ color: '#303972' }}>{student.address?.split(',')[0]}</td>
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

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center p-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#4D44B5] text-[#4D44B5] rounded-full font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#4D44B5] border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={20} />
                                        Load More Students
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
