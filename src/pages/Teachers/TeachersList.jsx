import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Download, Send, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useRefresh } from '../../context/RefreshContext';
import TableSkeleton from '../../components/common/TableSkeleton';
import AddEditTeacher from './AddEditTeacher';
import './TeachersList.css';

export default function TeachersList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Data State
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    // Fetch Data
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const data = await api.getTeachers();
                setTeachers(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch teachers:", err);
                setError("Failed to load teachers data.");
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchTeachers();
    }, [refreshKey]);

    // Unique Select Options
    const uniqueSubjects = useMemo(() => {
        const subjects = teachers.map(t => t.subject);
        return [...new Set(subjects)].sort();
    }, [teachers]);

    const uniqueDepartments = useMemo(() => {
        const departments = teachers.map(t => t.department || 'General');
        return [...new Set(departments)].sort();
    }, [teachers]);

    // Filter Logic
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const name = teacher.name?.toLowerCase() || '';
            const subject = teacher.subject?.toLowerCase() || '';
            const email = teacher.email?.toLowerCase() || '';
            const teacherId = teacher.teacherId?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch = searchTerm === '' ||
                name.includes(searchLower) ||
                subject.includes(searchLower) ||
                email.includes(searchLower) ||
                teacherId.includes(searchLower);

            const matchesSubject = subjectFilter === 'All' || teacher.subject === subjectFilter;
            const matchesDepartment = departmentFilter === 'All' || (teacher.department || 'General') === departmentFilter;

            return matchesSearch && matchesSubject && matchesDepartment;
        });
    }, [teachers, searchTerm, subjectFilter, departmentFilter]);

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

    const handleSaveTeacher = (teacherData) => {
        if (currentTeacher) {
            setTeachers(teachers.map(t => t.id === currentTeacher.id ? { ...t, ...teacherData } : t));
        } else {
            const newTeacher = {
                id: teachers.length + 1,
                ...teacherData
            };
            setTeachers([newTeacher, ...teachers]);
        }
        setIsEditing(false);
        setCurrentTeacher(null);
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
                    {uniqueSubjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
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
                {(searchTerm || subjectFilter !== 'All' || departmentFilter !== 'All') && (
                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setSubjectFilter('All');
                            setDepartmentFilter('All');
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
                            <th>Department</th>
                            <th>Experience</th>
                            <th>City</th>
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
                                            <div className="teacher-avatar">
                                                {teacher.name.charAt(0)}
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
                                    <td style={{ color: '#303972' }}>{teacher.department || 'General'}</td>
                                    <td>
                                        <span className="grade-badge" style={{ background: '#E8F5E9', color: '#00B69B' }}>
                                            {teacher.experience ? `${teacher.experience} years` : 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#303972' }}>{teacher.city}</td>
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
                                                setDepartmentFilter('All');
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
