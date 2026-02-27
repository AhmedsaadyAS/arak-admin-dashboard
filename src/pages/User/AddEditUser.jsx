import React, { useState, useMemo } from 'react';
import { getPermissionsForRole, getRoleDescription, PERMISSIONS } from '../../config/permissions';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

// Map config/permissions.js constants to display-friendly module groups
const PERMISSION_DISPLAY_MAP = [
    {
        module: 'Students',
        permissions: [
            { key: PERMISSIONS.STUDENTS, label: 'View' },
            { key: PERMISSIONS.CREATE_STUDENT, label: 'Add' },
            { key: PERMISSIONS.EDIT_STUDENT, label: 'Edit' },
            { key: PERMISSIONS.DELETE_STUDENT, label: 'Delete' },
        ]
    },
    {
        module: 'Teachers',
        permissions: [
            { key: PERMISSIONS.TEACHERS, label: 'View' },
            { key: PERMISSIONS.CREATE_TEACHER, label: 'Add' },
            { key: PERMISSIONS.EDIT_TEACHER, label: 'Edit' },
            { key: PERMISSIONS.DELETE_TEACHER, label: 'Delete' },
        ]
    },
    {
        module: 'Schedule',
        permissions: [
            { key: PERMISSIONS.SCHEDULE, label: 'View' },
            { key: PERMISSIONS.MANAGE_SCHEDULE, label: 'Manage' },
        ]
    },
    {
        module: 'Events',
        permissions: [
            { key: PERMISSIONS.EVENTS, label: 'View' },
        ]
    },
    {
        module: 'Fees',
        permissions: [
            { key: PERMISSIONS.FEES, label: 'View' },
            { key: PERMISSIONS.MANAGE_FEES, label: 'Manage' },
        ]
    },
    {
        module: 'Reports',
        permissions: [
            { key: PERMISSIONS.REPORTS, label: 'View' },
            { key: PERMISSIONS.VIEW_REPORTS, label: 'View Reports' },
            { key: PERMISSIONS.EXPORT_DATA, label: 'Export' },
        ]
    },
    {
        module: 'Gradebook',
        permissions: [
            { key: PERMISSIONS.GRADEBOOK, label: 'View' },
            { key: PERMISSIONS.MANAGE_GRADES, label: 'Manage' },
        ]
    },
    {
        module: 'Settings',
        permissions: [
            { key: PERMISSIONS.SETTINGS, label: 'View & Edit' },
        ]
    },
    {
        module: 'Chat',
        permissions: [
            { key: PERMISSIONS.CHAT, label: 'Access' },
        ]
    },
    {
        module: 'User Management',
        permissions: [
            { key: PERMISSIONS.USER_MANAGEMENT, label: 'View' },
            { key: PERMISSIONS.CREATE_USER, label: 'Add' },
            { key: PERMISSIONS.EDIT_USER, label: 'Edit' },
            { key: PERMISSIONS.DELETE_USER, label: 'Delete' },
        ]
    },
];

export default function AddEditUser({ user, userType, currentUserRole, onBack, onSave, roles = [], students = [] }) {
    const isAdminMode = userType === 'admin';
    const isParentMode = userType === 'parent';

    // Admin form state
    const [adminFormData, setAdminFormData] = useState({
        name: isAdminMode && user ? user.name : '',
        email: isAdminMode && user ? user.email : '',
        password: '',
        roleId: isAdminMode && user ? user.roleId : 2, // Default to School Administrator
        status: isAdminMode && user ? user.status : 'Active'
    });

    // Parent form state
    const [parentFormData, setParentFormData] = useState({
        parentName: isParentMode && user ? user.parentName : '',
        username: isParentMode && user ? user.username : '',
        email: isParentMode && user ? user.email : '',
        phone: isParentMode && user ? user.phone : '',
        password: '',
        linkedStudents: isParentMode && user ? user.linkedStudents : [],
        status: isParentMode && user ? user.status : 'Active'
    });

    // Student search and filter state
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');

    // Auto-compute permissions based on selected role
    const selectedRoleName = useMemo(() => {
        // Use == for loose comparison: db.json role IDs are strings ("2") but roleId is a number (2)
        const role = roles.find(r => String(r.id) === String(adminFormData.roleId));
        return role?.name || 'Unknown';
    }, [adminFormData.roleId, roles]);

    const rolePermissions = useMemo(() => {
        return getPermissionsForRole(selectedRoleName);
    }, [selectedRoleName]);

    const roleDescription = useMemo(() => {
        return getRoleDescription(selectedRoleName);
    }, [selectedRoleName]);

    // Get unique grades for filter
    const uniqueGrades = useMemo(() => {
        if (!students || !Array.isArray(students)) return [];
        const grades = students.map(s => s.grade);
        return [...new Set(grades)].sort();
    }, [students]);

    // Filter students based on search and grade
    // Filter students based on search and grade
    const filteredStudentsForParent = useMemo(() => {
        if (!students || !Array.isArray(students)) return [];
        return students.filter(student => {
            const matchesSearch = studentSearchTerm === '' ||
                student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase());
            const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;
            return matchesSearch && matchesGrade;
        });
    }, [studentSearchTerm, gradeFilter, students]);

    // Filter roles based on current user's role
    const availableRoles = roles.filter(role => {
        if (currentUserRole === "Super Admin") {
            return true; // Super Admin can assign all roles
        }
        // Non-Super Admins cannot create Super Admins
        return role.name !== "Super Admin";
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isAdminMode) {
            // Build the permissions structure from the role's actual permissions
            const permissionsForSave = PERMISSION_DISPLAY_MAP.map(mod => ({
                module: mod.module,
                permissions: mod.permissions
                    .filter(p => rolePermissions.includes(p.key))
                    .map(p => p.key)
            })).filter(mod => mod.permissions.length > 0);

            const userData = {
                ...adminFormData,
                role: selectedRoleName,
                permissions: permissionsForSave
            };
            onSave && onSave(userData, 'admin');
        } else {
            const userData = {
                ...parentFormData
            };
            onSave && onSave(userData, 'parent');
        }
    };

    // togglePermission removed - permissions are now read-only and driven by role

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
                                    <label htmlFor="adminName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                                    <input
                                        id="adminName"
                                        name="name"
                                        type="text"
                                        value={adminFormData.name}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adminEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                                    <input
                                        id="adminEmail"
                                        name="email"
                                        type="email"
                                        value={adminFormData.email}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adminPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Password {user && '(leave blank to keep current)'}
                                    </label>
                                    <input
                                        id="adminPassword"
                                        name="password"
                                        type="password"
                                        value={adminFormData.password}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required={!user}
                                        placeholder={user ? "Leave blank to keep current" : "Enter password"}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adminRole" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Role *</label>
                                    <select
                                        id="adminRole"
                                        name="roleId"
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
                                <div>
                                    <label htmlFor="adminStatus" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status *</label>
                                    <select
                                        id="adminStatus"
                                        name="status"
                                        value={adminFormData.status}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, status: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permissions Grid - Auto-populated from Role */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>Permissions</h4>
                                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', background: 'var(--primary-color)', color: 'white', borderRadius: '12px' }}>
                                        Auto-assigned by role
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem', fontStyle: 'italic' }}>
                                    {selectedRoleName}: {roleDescription}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                    {PERMISSION_DISPLAY_MAP.map(mod => {
                                        const hasAny = mod.permissions.some(p => rolePermissions.includes(p.key));
                                        return (
                                            <div key={mod.module} style={{ padding: '1rem', background: hasAny ? '#f0f4ff' : '#f9fafb', borderRadius: '8px', border: hasAny ? '1px solid #d0d9f0' : '1px solid #e5e7eb', opacity: hasAny ? 1 : 0.6 }}>
                                                <h5 style={{ margin: '0 0 0.75rem 0', color: hasAny ? 'var(--primary-color)' : '#999' }}>{mod.module}</h5>
                                                {mod.permissions.map(perm => {
                                                    const isGranted = rolePermissions.includes(perm.key);
                                                    return (
                                                        <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'default' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isGranted}
                                                                disabled
                                                                readOnly
                                                                style={{ cursor: 'default' }}
                                                            />
                                                            <span style={{ fontSize: '0.9rem', color: isGranted ? 'var(--text-dark)' : '#aaa' }}>{perm.label}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* PARENT MODE FORM */}
                    {isParentMode && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label htmlFor="parentName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Parent Full Name *</label>
                                    <input
                                        id="parentName"
                                        name="parentName"
                                        type="text"
                                        value={parentFormData.parentName}
                                        onChange={(e) => setParentFormData({ ...parentFormData, parentName: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="e.g., Ahmad bin Hassan"
                                        autoComplete="name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="parentUsername" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Username *</label>
                                    <input
                                        id="parentUsername"
                                        name="username"
                                        type="text"
                                        value={parentFormData.username}
                                        onChange={(e) => setParentFormData({ ...parentFormData, username: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="e.g., ahmad.hassan (for mobile login)"
                                        autoComplete="username"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="parentEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                                    <input
                                        id="parentEmail"
                                        name="email"
                                        type="email"
                                        value={parentFormData.email}
                                        onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="parent@email.com"
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="parentPhone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                                    <input
                                        id="parentPhone"
                                        name="phone"
                                        type="tel"
                                        value={parentFormData.phone}
                                        onChange={(e) => setParentFormData({ ...parentFormData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                        placeholder="+60 12-345 6789"
                                        autoComplete="tel"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="parentStatus" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status *</label>
                                    <select
                                        id="parentStatus"
                                        name="status"
                                        value={parentFormData.status}
                                        onChange={(e) => setParentFormData({ ...parentFormData, status: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="parentPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        {user ? 'Password (leave blank to keep current)' : 'Temporary Password *'}
                                    </label>
                                    <input
                                        id="parentPassword"
                                        name="password"
                                        type="password"
                                        value={parentFormData.password}
                                        onChange={(e) => setParentFormData({ ...parentFormData, password: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required={!user}
                                        placeholder={user ? "Leave blank to keep current" : "Parent will use this to login to mobile app"}
                                        autoComplete="new-password"
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
                                        id="studentSearch"
                                        name="studentSearch"
                                        type="text"
                                        placeholder="Search students by name or ID..."
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                    <select
                                        id="gradeFilter"
                                        name="gradeFilter"
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
                                            Showing {filteredStudentsForParent.length} of {students.length} students
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
