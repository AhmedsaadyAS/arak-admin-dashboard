import React, { useState, useMemo } from 'react';
import { rolesData } from '../../mock/roles';
import { permissionsData } from '../../mock/permissions';
import { studentsData } from '../../mock/students';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function AddEditUser({ user, userType, currentUserRole, onBack, onSave }) {
    const isAdminMode = userType === 'admin';
    const isParentMode = userType === 'parent';

    // Admin form state
    const [adminFormData, setAdminFormData] = useState({
        name: isAdminMode && user ? user.name : '',
        email: isAdminMode && user ? user.email : '',
        password: '',
        roleId: isAdminMode && user ? user.roleId : 2 // Default to School Administrator
    });

    // Parent form state
    const [parentFormData, setParentFormData] = useState({
        parentName: isParentMode && user ? user.parentName : '',
        username: isParentMode && user ? user.username : '',
        email: isParentMode && user ? user.email : '',
        phone: isParentMode && user ? user.phone : '',
        password: '',
        linkedStudents: isParentMode && user ? user.linkedStudents : []
    });

    // Student search and filter state
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');

    const [selectedPermissions, setSelectedPermissions] = useState(
        permissionsData.map(module => ({
            module: module.module,
            permissions: module.permissions.map(p => p.id)
        }))
    );

    // Get unique grades for filter
    const uniqueGrades = useMemo(() => {
        const grades = studentsData.map(s => s.grade);
        return [...new Set(grades)].sort();
    }, []);

    // Filter students based on search and grade
    const filteredStudentsForParent = useMemo(() => {
        return studentsData.filter(student => {
            const matchesSearch = studentSearchTerm === '' ||
                student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase());
            const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;
            return matchesSearch && matchesGrade;
        });
    }, [studentSearchTerm, gradeFilter]);

    // Filter roles based on current user's role
    const availableRoles = rolesData.filter(role => {
        if (currentUserRole === "Super Admin") {
            return true; // Super Admin can assign all roles
        }
        // Non-Super Admins cannot create Super Admins
        return role.name !== "Super Admin";
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isAdminMode) {
            const roleName = rolesData.find(r => r.id === adminFormData.roleId)?.name || 'Unknown';
            const userData = {
                ...adminFormData,
                role: roleName,
                permissions: selectedPermissions
            };
            onSave && onSave(userData, 'admin');
        } else {
            const userData = {
                ...parentFormData
            };
            onSave && onSave(userData, 'parent');
        }
    };

    const togglePermission = (module, permissionId) => {
        setSelectedPermissions(prev => {
            return prev.map(m => {
                if (m.module === module) {
                    const perms = m.permissions.includes(permissionId)
                        ? m.permissions.filter(p => p !== permissionId)
                        : [...m.permissions, permissionId];
                    return { ...m, permissions: perms };
                }
                return m;
            });
        });
    };

    const toggleStudentLink = (studentId) => {
        setParentFormData(prev => ({
            ...prev,
            linkedStudents: prev.linkedStudents.includes(studentId)
                ? prev.linkedStudents.filter(id => id !== studentId)
                : [...prev.linkedStudents, studentId]
        }));
    };

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to User Management</button>

            <div className="chart-card">
                <div className="card-header">
                    <h3>
                        {isAdminMode && (user ? 'Edit Admin User' : 'Add New Admin User')}
                        {isParentMode && (user ? 'Edit Parent User' : 'Add New Parent User')}
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ADMIN MODE FORM */}
                    {isAdminMode && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                                    <input
                                        type="text"
                                        value={adminFormData.name}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                                    <input
                                        type="email"
                                        value={adminFormData.email}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Password {user && '(leave blank to keep current)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={adminFormData.password}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required={!user}
                                        placeholder={user ? "Leave blank to keep current" : "Enter password"}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Role *</label>
                                    <select
                                        value={adminFormData.roleId}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, roleId: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    {currentUserRole !== "Super Admin" && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                                            Note: You cannot assign Super Admin role
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div>
                                <h4 style={{ marginBottom: '1rem' }}>Permissions</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    {permissionsData.map(module => (
                                        <div key={module.module} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>{module.module}</h5>
                                            {module.permissions.map(perm => (
                                                <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.find(m => m.module === module.module)?.permissions.includes(perm.id)}
                                                        onChange={() => togglePermission(module.module, perm.id)}
                                                    />
                                                    <span style={{ fontSize: '0.9rem' }}>{perm.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* PARENT MODE FORM */}
                    {isParentMode && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Parent Full Name *</label>
                                    <input
                                        type="text"
                                        value={parentFormData.parentName}
                                        onChange={(e) => setParentFormData({ ...parentFormData, parentName: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="e.g., Ahmad bin Hassan"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Username *</label>
                                    <input
                                        type="text"
                                        value={parentFormData.username}
                                        onChange={(e) => setParentFormData({ ...parentFormData, username: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="e.g., ahmad.hassan (for mobile login)"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                                    <input
                                        type="email"
                                        value={parentFormData.email}
                                        onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="parent@email.com"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                                    <input
                                        type="tel"
                                        value={parentFormData.phone}
                                        onChange={(e) => setParentFormData({ ...parentFormData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="+60 12-345 6789"
                                    />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        {user ? 'Password (leave blank to keep current)' : 'Temporary Password *'}
                                    </label>
                                    <input
                                        type="password"
                                        value={parentFormData.password}
                                        onChange={(e) => setParentFormData({ ...parentFormData, password: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required={!user}
                                        placeholder={user ? "Leave blank to keep current" : "Parent will use this to login to mobile app"}
                                    />
                                    {!user && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                                            This is a temporary password. Parent should change it after first login.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Linked Students */}
                            <div>
                                <h4 style={{ marginBottom: '1rem' }}>Linked Students *</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>
                                    Select which students this parent can view and manage in the mobile app:
                                </p>

                                {/* Search and Quick Actions */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        placeholder="Search students by name or ID..."
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                    <select
                                        value={gradeFilter}
                                        onChange={(e) => setGradeFilter(e.target.value)}
                                        style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        <option value="All">All Grades</option>
                                        {uniqueGrades.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const filtered = filteredStudentsForParent.map(s => s.id);
                                            setParentFormData({ ...parentFormData, linkedStudents: filtered });
                                        }}
                                        style={{ padding: '0.75rem 1rem', border: '1px solid var(--primary-color)', background: 'white', color: 'var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}
                                    >
                                        Select All ({filteredStudentsForParent.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setParentFormData({ ...parentFormData, linkedStudents: [] })}
                                        style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Selected Count */}
                                <div style={{ padding: '0.75rem 1rem', background: parentFormData.linkedStudents.length > 0 ? '#F3F4FF' : '#FFF4E5', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                                        {parentFormData.linkedStudents.length} student{parentFormData.linkedStudents.length !== 1 ? 's' : ''} selected
                                    </span>
                                    {parentFormData.linkedStudents.length > 0 && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                            Showing {filteredStudentsForParent.length} of {studentsData.length} students
                                        </span>
                                    )}
                                </div>

                                {/* Student Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    {filteredStudentsForParent.length > 0 ? (
                                        filteredStudentsForParent.map(student => (
                                            <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: parentFormData.linkedStudents.includes(student.id) ? '#F3F4FF' : 'white', border: parentFormData.linkedStudents.includes(student.id) ? '2px solid var(--primary-color)' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={parentFormData.linkedStudents.includes(student.id)}
                                                    onChange={() => toggleStudentLink(student.id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                                        {student.grade} • ID: {student.studentId}
                                                    </div>
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
                                            No students found matching your search
                                        </div>
                                    )}
                                </div>
                                {parentFormData.linkedStudents.length === 0 && (
                                    <p style={{ color: '#EE3636', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Please select at least one student
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Form Actions */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onBack}
                            style={{ padding: '0.75rem 2rem', border: '1px solid #e5e7eb', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isParentMode && parentFormData.linkedStudents.length === 0}
                            style={{ padding: '0.75rem 2rem', background: isParentMode && parentFormData.linkedStudents.length === 0 ? '#ccc' : 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: isParentMode && parentFormData.linkedStudents.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                        >
                            {user ? `Update ${isAdminMode ? 'Admin' : 'Parent'}` : `Create ${isAdminMode ? 'Admin' : 'Parent'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
