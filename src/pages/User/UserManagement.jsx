import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, KeyRound, Users as UsersIcon } from 'lucide-react';
import { usersData } from '../../mock/users';
import { parentsData } from '../../mock/parents';
import { studentsData } from '../../mock/students';
import { rolesData } from '../../mock/roles';
import AddEditUser from './AddEditUser';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function UserManagement() {
    // Simulate current logged-in user role (in real app, this would come from auth context)
    const currentUserRole = "Super Admin"; // Change to test different roles: "School Administrator", "Finance Administrator"

    const [activeTab, setActiveTab] = useState('admins'); // 'admins' or 'parents'
    const [adminUsers, setAdminUsers] = useState(usersData);
    const [parents, setParents] = useState(parentsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);
    const [editUserType, setEditUserType] = useState('admin'); // 'admin' or 'parent'

    // Permission checks
    const canAddAdmin = currentUserRole === "Super Admin";
    const canDeleteAdmin = currentUserRole === "Super Admin";
    const canAddParent = ["Super Admin", "School Administrator"].includes(currentUserRole);
    const canEditParent = ["Super Admin", "School Administrator"].includes(currentUserRole);
    const canDeleteParent = ["Super Admin", "School Administrator"].includes(currentUserRole);

    // Filter admin users
    const filteredAdmins = adminUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Filter parent users
    const filteredParents = parents.filter(parent => {
        const matchesSearch = parent.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Get student names for parent display
    const getStudentNames = (studentIds) => {
        return studentIds.map(id => {
            const student = studentsData.find(s => s.id === id);
            return student ? student.name : 'Unknown';
        }).join(', ');
    };

    const handleDeleteAdmin = (userName, userRole) => {
        if (!canDeleteAdmin) {
            alert('You do not have permission to delete admin users.');
            return;
        }
        if (confirm(`Are you sure you want to delete admin user: ${userName}?`)) {
            setAdminUsers(adminUsers.filter(u => u.name !== userName));
        }
    };

    const handleDeleteParent = (parentId) => {
        if (!canDeleteParent) {
            alert('You do not have permission to delete parent users.');
            return;
        }
        const parent = parents.find(p => p.id === parentId);
        if (confirm(`Are you sure you want to delete parent: ${parent.parentName}?`)) {
            setParents(parents.filter(p => p.id !== parentId));
        }
    };

    const handleResetPassword = (parentId) => {
        const parent = parents.find(p => p.id === parentId);
        alert(`Password reset email sent to ${parent.email}\n\nTemporary Password: ${Math.random().toString(36).slice(-8)}\n\n(This is a mock action)`);
    };

    const handleAddEditAdmin = (user) => {
        if (!canAddAdmin && !user) {
            alert('You do not have permission to add admin users.');
            return;
        }
        setCurrentEditUser(user);
        setEditUserType('admin');
        setIsEditing(true);
    };

    const handleAddEditParent = (parent) => {
        if (!canAddParent && !parent) {
            alert('You do not have permission to add parent users.');
            return;
        }
        setCurrentEditUser(parent);
        setEditUserType('parent');
        setIsEditing(true);
    };

    const handleSaveUser = (userData, userType) => {
        if (userType === 'admin') {
            if (currentEditUser) {
                // Update existing admin
                setAdminUsers(adminUsers.map(u => u.id === currentEditUser.id ? { ...u, ...userData } : u));
            } else {
                // Add new admin
                const newAdmin = {
                    id: adminUsers.length + 1,
                    status: 'Active',
                    lastLogin: 'Never',
                    ...userData
                };
                setAdminUsers([...adminUsers, newAdmin]);
            }
        } else {
            if (currentEditUser) {
                // Update existing parent
                setParents(parents.map(p => p.id === currentEditUser.id ? { ...p, ...userData } : p));
            } else {
                // Add new parent
                const newParent = {
                    id: parents.length + 1,
                    status: 'Active',
                    lastLogin: 'Never',
                    createdAt: new Date().toISOString().split('T')[0],
                    ...userData
                };
                setParents([...parents, newParent]);
            }
        }
        setIsEditing(false);
        setCurrentEditUser(null);
    };

    if (isEditing) {
        return (
            <AddEditUser
                user={currentEditUser}
                userType={editUserType}
                currentUserRole={currentUserRole}
                onBack={() => {
                    setIsEditing(false);
                    setCurrentEditUser(null);
                }}
                onSave={(userData) => handleSaveUser(userData, editUserType)}
            />
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header with Tabs */}
            <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>User Management</h3>
                    <div className="topbar-actions">
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder={activeTab === 'admins' ? "Search admin users..." : "Search parents..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {activeTab === 'admins' && (
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginRight: '1rem' }}
                            >
                                <option>All</option>
                                {rolesData.map(role => <option key={role.id}>{role.name}</option>)}
                            </select>
                        )}
                        {activeTab === 'admins' && canAddAdmin && (
                            <button
                                className="icon-btn"
                                onClick={() => handleAddEditAdmin(null)}
                                style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '40px', background: 'var(--primary-color)', color: 'white', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <Plus size={20} />
                                <span>Add Admin</span>
                            </button>
                        )}
                        {activeTab === 'parents' && canAddParent && (
                            <button
                                className="icon-btn"
                                onClick={() => handleAddEditParent(null)}
                                style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '40px', background: 'var(--secondary-color)', color: 'white', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <Plus size={20} />
                                <span>Add Parent</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #f3f4f6' }}>
                    <button
                        onClick={() => {
                            setActiveTab('admins');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'admins' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'admins' ? 'var(--primary-color)' : 'var(--text-gray)',
                            fontWeight: activeTab === 'admins' ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UsersIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Admin Users ({adminUsers.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('parents');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'parents' ? '3px solid var(--secondary-color)' : '3px solid transparent',
                            color: activeTab === 'parents' ? 'var(--secondary-color)' : 'var(--text-gray)',
                            fontWeight: activeTab === 'parents' ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UsersIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Parent Users ({parents.length})
                    </button>
                </div>
            </div>

            {/* Admin Users Table */}
            {activeTab === 'admins' && (
                <div className="chart-card" style={{ padding: '0' }}>
                    <table className="simple-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', padding: '0 1.5rem' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdmins.map(user => (
                                <tr key={user.id} style={{ background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td><span className="badge" style={{ background: '#F3F4FF', color: 'var(--primary-color)' }}>{user.role}</span></td>
                                    <td>
                                        <span className={`badge ${user.status === 'Active' ? 'status-present' : 'status-absent'}`}
                                            style={{
                                                background: user.status === 'Active' ? '#E6F9F0' : '#FEECEC',
                                                color: user.status === 'Active' ? '#00B69B' : '#EE3636'
                                            }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{user.lastLogin}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleAddEditAdmin(user)}
                                                style={{ width: '32px', height: '32px' }}
                                                title="Edit admin user"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {canDeleteAdmin && (
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleDeleteAdmin(user.name, user.role)}
                                                    style={{ width: '32px', height: '32px', color: '#EE3636' }}
                                                    title="Delete admin user"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Parent Users Table */}
            {activeTab === 'parents' && (
                <div className="chart-card" style={{ padding: '0' }}>
                    <table className="simple-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', padding: '0 1.5rem' }}>
                        <thead>
                            <tr>
                                <th>Parent Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Linked Students</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParents.map(parent => (
                                <tr key={parent.id} style={{ background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{parent.parentName}</td>
                                    <td><span className="badge" style={{ background: '#FFF4E5', color: '#FFA756' }}>{parent.username}</span></td>
                                    <td>{parent.email}</td>
                                    <td>{parent.phone}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                        {getStudentNames(parent.linkedStudents)}
                                    </td>
                                    <td>
                                        <span className={`badge ${parent.status === 'Active' ? 'status-present' : 'status-absent'}`}
                                            style={{
                                                background: parent.status === 'Active' ? '#E6F9F0' : '#FEECEC',
                                                color: parent.status === 'Active' ? '#00B69B' : '#EE3636'
                                            }}>
                                            {parent.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {canEditParent && (
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleAddEditParent(parent)}
                                                    style={{ width: '32px', height: '32px' }}
                                                    title="Edit parent"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canEditParent && (
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleResetPassword(parent.id)}
                                                    style={{ width: '32px', height: '32px', color: '#FFA756' }}
                                                    title="Reset password"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                            )}
                                            {canDeleteParent && (
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleDeleteParent(parent.id)}
                                                    style={{ width: '32px', height: '32px', color: '#EE3636' }}
                                                    title="Delete parent"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
