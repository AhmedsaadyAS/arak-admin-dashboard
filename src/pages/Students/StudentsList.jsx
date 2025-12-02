import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, Phone, Mail, Download, Edit2, Trash2 } from 'lucide-react';
import { studentsData } from '../../mock/students';
import AddEditStudent from './AddEditStudent';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function StudentsList({ onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [students, setStudents] = useState(studentsData);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Get unique grades for filter
    const uniqueGrades = useMemo(() => {
        const grades = students.map(s => s.grade);
        return [...new Set(grades)].sort();
    }, [students]);

    // Advanced filtering with multiple criteria
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const name = student.name?.toLowerCase() || '';
            const parentName = student.parentName?.toLowerCase() || '';
            const studentId = student.studentId?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch = searchTerm === '' ||
                name.includes(searchLower) ||
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
            // Update existing student
            setStudents(students.map(s => s.id === currentStudent.id ? { ...s, ...studentData } : s));
        } else {
            // Add new student
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
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Students</h3>
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
                        placeholder="Search by name, parent, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>

                <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
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
                    <option value="All">All Grades</option>
                    {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>

                <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
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
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

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
                    onClick={handleAddStudent}
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
                    Add Student
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
                <span>Showing <strong style={{ color: '#303972' }}>{filteredStudents.length}</strong> of {students.length} students</span>
                {(searchTerm || gradeFilter !== 'All' || genderFilter !== 'All' || statusFilter !== 'All') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setGradeFilter('All');
                            setGenderFilter('All');
                            setStatusFilter('All');
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

            {/* Students Table */}
            <div className="chart-card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="simple-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', padding: '0 0.5rem' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Parent</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Grade</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Gender</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>City</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => onViewDetails && onViewDetails(student.id)}
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
                                                {student.studentId}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: '#C1BBEB',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#303972' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#A098AE' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', color: '#303972', fontWeight: '500' }}>{student.parentName}</td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 1rem',
                                                background: '#FF9F43',
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', color: '#303972' }}>{student.gender}</td>
                                        <td style={{ padding: '1.2rem 1rem', color: '#303972' }}>{student.city}</td>
                                        <td style={{ padding: '1.2rem 1rem', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleCall(student.name, e)}
                                                    title="Call Parent"
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
                                                    onClick={(e) => handleEmail(student.name, e)}
                                                    title="Email Parent"
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
                                                    onClick={(e) => handleEditStudent(student, e)}
                                                    title="Edit Student"
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
                                            <h3 style={{ margin: 0, color: '#303972' }}>No Students Found</h3>
                                            <p style={{ margin: 0, color: '#A098AE' }}>
                                                We couldn't find any students matching your search.
                                                <br />Try adjusting your filters or search terms.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setGradeFilter('All');
                                                    setGenderFilter('All');
                                                    setStatusFilter('All');
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
