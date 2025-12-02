import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, Phone, Mail, Download, Send, Edit2, Trash2 } from 'lucide-react';
import { teachersData } from '../../mock/teachers';
import AddEditTeacher from './AddEditTeacher';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function TeachersList({ onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [teachers, setTeachers] = useState(teachersData);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    // Get unique subjects and departments for filters
    const uniqueSubjects = useMemo(() => {
        const subjects = teachers.map(t => t.subject);
        return [...new Set(subjects)].sort();
    }, [teachers]);

    const uniqueDepartments = useMemo(() => {
        const departments = teachers.map(t => t.department || 'General');
        return [...new Set(departments)].sort();
    }, [teachers]);

    // Advanced filtering
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const matchesSearch = searchTerm === '' ||
                teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.teacherId && teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesSubject = subjectFilter === 'All' || teacher.subject === subjectFilter;
            const matchesDepartment = departmentFilter === 'All' || (teacher.department || 'General') === departmentFilter;

            return matchesSearch && matchesSubject && matchesDepartment;
        });
    }, [teachers, searchTerm, subjectFilter, departmentFilter]);

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
            // Update existing teacher
            setTeachers(teachers.map(t => t.id === currentTeacher.id ? { ...t, ...teacherData } : t));
        } else {
            // Add new teacher
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

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Teachers</h3>
            </div>

            {/* Enhanced Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'white',
                padding: '1rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
                    <Search size={20} className="search-icon" style={{ color: '#A098AE' }} />
                    <input
                        type="text"
                        placeholder="Search by name, subject, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>

                <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        color: '#303972',
                        fontWeight: '500'
                    }}
                >
                    <option value="All">All Subjects</option>
                    {uniqueSubjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>

                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        color: '#303972',
                        fontWeight: '500'
                    }}
                >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>

                <button
                    onClick={handleBulkEmail}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid var(--secondary-color)',
                        background: 'white',
                        color: 'var(--secondary-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    <Send size={18} />
                    Email All
                </button>

                <button
                    onClick={handleExport}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid var(--primary-color)',
                        background: 'white',
                        color: 'var(--primary-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    <Download size={18} />
                    Export
                </button>

                <button
                    onClick={handleAddTeacher}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 10px rgba(77, 68, 181, 0.2)'
                    }}
                >
                    <Plus size={18} />
                    Add Teacher
                </button>
            </div>

            {/* Results Counter */}
            <div style={{
                padding: '0 0.5rem',
                marginBottom: '1rem',
                fontWeight: '500',
                color: '#A098AE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem'
            }}>
                <span>Showing <strong style={{ color: '#303972' }}>{filteredTeachers.length}</strong> of {teachers.length} teachers</span>
                {(searchTerm || subjectFilter !== 'All' || departmentFilter !== 'All') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSubjectFilter('All');
                            setDepartmentFilter('All');
                        }}
                        style={{
                            padding: '0.4rem 1rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#FB7D5B',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textDecoration: 'underline'
                        }}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Teachers Table */}
            <div className="chart-card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="simple-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', padding: '0 0.5rem' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Subject</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Experience</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>City</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => onViewDetails && onViewDetails(teacher.id)}
                                        style={{
                                            cursor: 'pointer',
                                            background: 'white',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '1.2rem 1rem', borderRadius: '12px 0 0 12px' }}>
                                            <span style={{ fontWeight: '700', color: '#303972' }}>
                                                {teacher.teacherId}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: '#FF9F43',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#303972' }}>{teacher.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#A098AE' }}>{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 1rem',
                                                background: '#FFF4E5',
                                                color: '#FF8C00',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', color: '#303972' }}>{teacher.department || 'General'}</td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 1rem',
                                                background: '#E8F5E9',
                                                color: '#00B69B',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {teacher.experience || '5+'} years
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', color: '#303972' }}>{teacher.city}</td>
                                        <td style={{ padding: '1.2rem 1rem', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleCall(teacher.name, e)}
                                                    title="Call Teacher"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#F3F4FF',
                                                        color: '#4D44B5'
                                                    }}
                                                >
                                                    <Phone size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleEmail(teacher.email, e)}
                                                    title="Email Teacher"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#F3F4FF',
                                                        color: '#4D44B5'
                                                    }}
                                                >
                                                    <Mail size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleEditTeacher(teacher, e)}
                                                    title="Edit Teacher"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#F3F4FF',
                                                        color: '#4D44B5'
                                                    }}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: '#F3F4FF',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#4D44B5'
                                            }}>
                                                <Search size={30} />
                                            </div>
                                            <h3 style={{ margin: 0, color: '#303972' }}>No Teachers Found</h3>
                                            <p style={{ margin: 0, color: '#A098AE' }}>
                                                We couldn't find any teachers matching your search.
                                                <br />Try adjusting your filters or search terms.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSubjectFilter('All');
                                                    setDepartmentFilter('All');
                                                }}
                                                style={{
                                                    marginTop: '0.5rem',
                                                    padding: '0.6rem 1.5rem',
                                                    background: '#4D44B5',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
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
            </div>
        </div>
    );
}
