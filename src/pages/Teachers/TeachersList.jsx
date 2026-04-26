import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Download, Send, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useRefresh } from '../../context/RefreshContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../config/permissions';
import TableSkeleton from '../../components/common/TableSkeleton';
import ConfirmModal from '../../components/common/ConfirmModal';
import DeleteWarningModal from '../../components/common/DeleteWarningModal';
import AddEditTeacher from './AddEditTeacher';
import './TeachersList.css';

export default function TeachersList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();
    const { hasPermission } = useAuth();

    const canDeleteTeacher = hasPermission(PERMISSIONS.DELETE_TEACHER);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');

    // Data State
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]); // ✅ Fetch from /subjects endpoint
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [deleteDependencies, setDeleteDependencies] = useState(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // ✅ Fetch both teachers and subjects
                const [teachersData, subjectsData] = await Promise.all([
                    api.getTeachers(),
                    api.getSubjects()
                ]);
                setTeachers(teachersData);
                setSubjects(subjectsData || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load teachers data.");
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchData();
    }, [refreshKey]);


    // Filter Logic
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const name = teacher.name?.toString().toLowerCase() || '';
            const subject = teacher.subject?.toString().toLowerCase() || '';
            const email = teacher.email?.toString().toLowerCase() || '';
            const teacherId = teacher.teacherId?.toString().toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch = searchTerm === '' ||
                name.includes(searchLower) ||
                subject.includes(searchLower) ||
                email.includes(searchLower) ||
                teacherId.includes(searchLower);

            const matchesSubject = subjectFilter === 'All' || teacher.subject === subjectFilter;

            return matchesSearch && matchesSubject;
        });
    }, [teachers, searchTerm, subjectFilter]);

    // Handlers
    const handleAddTeacher = () => {
        setCurrentTeacher(null);
        setIsEditing(true);
    };

    const handleEditTeacher = (teacher, e) => {
        e.stopPropagation();
        setCurrentTeacher(teacher);
        setIsEditing(true);
    };

    const handleSaveTeacher = async (teacherData) => {
        try {
            if (currentTeacher) {
                await api.updateTeacher(currentTeacher.id, teacherData);
            } else {
                await api.createTeacher(teacherData);
            }
            setIsEditing(false);
            setCurrentTeacher(null);
            
            // Refresh data from server
            const freshData = await api.getTeachers();
            setTeachers(freshData);
        } catch (error) {
            console.error("Failed to save teacher:", error);
            alert("Error saving teacher. Check console for details.");
        }
    };

    const handleCall = (teacherName, e) => {
        e.stopPropagation();
        alert(`Calling ${teacherName}...`);
    };

    const handleEmail = (teacherEmail, e) => {
        e.stopPropagation();
        alert(`Opening email to ${teacherEmail}...`);
    };

    const handleExport = () => {
        alert(`Exporting ${filteredTeachers.length} teachers to CSV...`);
    };

    const handleBulkEmail = () => {
        alert(`Composing email to ${filteredTeachers.length} teachers...`);
    };

    const handleDeleteTeacher = async (teacher, e) => {
        e.stopPropagation();
        if (!canDeleteTeacher) {
            alert('You do not have permission to delete teachers.');
            return;
        }
        
        setTeacherToDelete(teacher);
        setDeleteDependencies(null);
        
        try {
            // Check dependencies first
            const [classes, tasks, schedules] = await Promise.all([
                api.client.get('/classes', { params: { teacherId: teacher.id } }),
                api.client.get('/tasks', { params: { teacherId: teacher.id } }),
                api.client.get('/schedules', { params: { teacherId: teacher.id } })
            ]);

            const dependencies = {
                classes: classes.data?.length || 0,
                tasks: tasks.data?.length || 0,
                schedules: schedules.data?.length || 0
            };

            const totalDeps = dependencies.classes + dependencies.tasks + dependencies.schedules;

            if (totalDeps > 0) {
                setDeleteDependencies(dependencies);
                setShowDeleteWarning(true);
            } else {
                setShowDeleteModal(true);
            }
        } catch (err) {
            console.error('Failed to check dependencies:', err);
            setShowDeleteModal(true);
        }
    };

    const confirmDeleteTeacher = async () => {
        if (!teacherToDelete) return;
        
        try {
            await api.deleteTeacher(teacherToDelete.id);
            setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
            setShowDeleteModal(false);
            setTeacherToDelete(null);
        } catch (err) {
            console.error('Failed to delete teacher:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete teacher';
            alert(errorMsg);
            setShowDeleteModal(false);
            setTeacherToDelete(null);
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/teachers/${id}`);
    };

    if (isEditing) {
        return (
            <AddEditTeacher
                teacher={currentTeacher}
                onBack={() => {
                    setIsEditing(false);
                    setCurrentTeacher(null);
                }}
                onSave={handleSaveTeacher}
            />
        );
    }

    if (loading) return <TableSkeleton rows={8} />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <section className="teachers-list-container animate-fade-in">
            <header className="teachers-header">
                <h3>Teachers</h3>
            </header>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-container">
                    <Search size={20} className="search-icon-absolute" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, subject, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                >
                    <option value="All">All Subjects</option>
                    {subjects.map(subject => (
                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                </select>


                <button className="action-btn btn-secondary-outline" onClick={handleBulkEmail}>
                    <Send size={18} />
                    Email All
                </button>

                <button className="action-btn btn-outline" onClick={handleExport}>
                    <Download size={18} />
                    Export
                </button>

                <button className="action-btn btn-primary" onClick={handleAddTeacher}>
                    <Plus size={18} />
                    Add Teacher
                </button>
            </div>

            {/* Results Counter */}
            <div className="results-counter">
                <span>Showing <strong>{filteredTeachers.length}</strong> of {teachers.length} teachers</span>
                {(searchTerm || subjectFilter !== 'All') && (
                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setSubjectFilter('All');
                        }}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Teachers Table */}
            <div className="table-container">
                <table className="teachers-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Subject</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher) => (
                                <tr
                                    key={teacher.id}
                                    onClick={() => handleViewDetails(teacher.id)}
                                    className="teacher-row"
                                >
                                    <td>
                                        <span className="teacher-id">{teacher.teacherId}</span>
                                    </td>
                                    <td>
                                        <div className="teacher-info">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                background: 'linear-gradient(135deg, #f093fb, #f5a623)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {teacher.image ? (
                                                    <img
                                                        src={teacher.image?.startsWith('http')
                                                            ? teacher.image
                                                            : `http://localhost:5000${teacher.image}`}
                                                        alt={teacher.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>
                                                        {teacher.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="teacher-details">
                                                <h4>{teacher.name}</h4>
                                                <span>{teacher.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="subject-badge">{teacher.subject}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleCall(teacher.name, e)}
                                                title="Call Teacher"
                                            >
                                                <Phone size={18} />
                                            </button>
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleEmail(teacher.email, e)}
                                                title="Email Teacher"
                                            >
                                                <Mail size={18} />
                                            </button>
                                            <button
                                                className="icon-btn-sm"
                                                onClick={(e) => handleEditTeacher(teacher, e)}
                                                title="Edit Teacher"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {canDeleteTeacher && (
                                                <button
                                                    className="icon-btn-sm btn-delete"
                                                    onClick={(e) => handleDeleteTeacher(teacher, e)}
                                                    title="Delete Teacher"
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
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <Search size={30} />
                                        </div>
                                        <h3>No Teachers Found</h3>
                                        <p>
                                            We couldn't find any teachers matching your search.
                                            <br />Try adjusting your filters or search terms.
                                        </p>
                                        <button
                                            className="action-btn btn-primary"
                                            style={{ marginTop: '0.5rem', width: 'auto' }}
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSubjectFilter('All');
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
            
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Teacher"
                message={`Are you sure you want to delete "${teacherToDelete?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteTeacher}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setTeacherToDelete(null);
                }}
                variant="danger"
            />
            
            {/* Delete Warning Modal (when dependencies exist) */}
            <DeleteWarningModal
                isOpen={showDeleteWarning}
                entityType="teacher"
                entityName={teacherToDelete?.name}
                dependencies={deleteDependencies}
                onCancel={() => {
                    setShowDeleteWarning(false);
                    setTeacherToDelete(null);
                    setDeleteDependencies(null);
                }}
            />
        </section>
    );
}
