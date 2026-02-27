import React, { useState, useEffect } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function AddEditStudent({ student, onBack, onSave }) {
    const isEditMode = !!student;
    const [classes, setClasses] = useState([]);
    const [parents, setParents] = useState([]);

    const [formData, setFormData] = useState({
        name: student?.name || '',
        studentId: student?.studentId || '',
        email: student?.email || '',
        phone: student?.phone || '',
        grade: student?.grade || '',
        classId: student?.classId || '',
        className: student?.className || '',
        gender: student?.gender || 'Male',
        dateOfBirth: student?.dateOfBirth || '',
        placeOfBirth: 'Jakarta', // Default or from data
        address: student?.address || '',
        city: student?.city || '',
        parentId: student?.parentId || '',
        parentName: student?.parentName || '',
        parentEmail: student?.parentEmail || '',
        parentPhone: student?.parentPhone || '',
        status: student?.status || 'Active'
    });

    // Fetch classes and parents on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, parentsRes] = await Promise.all([
                    api.client.get('/classes'),
                    api.getParents()
                ]);
                setClasses(classesRes.data || []);
                setParents(parentsRes || []);
            } catch (error) {
                console.error('Failed to fetch form data:', error);
            }
        };
        fetchData();
    }, []);

    // Handle parent selection from dropdown
    const handleParentSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) {
            // "None" selected — clear parent fields
            setFormData(prev => ({
                ...prev,
                parentId: '',
                parentName: '',
                parentEmail: '',
                parentPhone: ''
            }));
            return;
        }
        const parent = parents.find(p => String(p.id) === String(selectedId));
        if (parent) {
            setFormData(prev => ({
                ...prev,
                parentId: parent.id,
                parentName: parent.parentName || '',
                parentEmail: parent.email || '',
                parentPhone: parent.phone || ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If class is selected, also set className
        if (name === 'classId') {
            const selectedClass = classes.find(c => c.id == value);
            setFormData(prev => ({
                ...prev,
                classId: value,
                className: selectedClass?.name || '',
                grade: selectedClass?.name || prev.grade
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Students List</button>

            <div className="chart-card">
                <div className="card-header">
                    <h3>{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section: Student Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Student Information
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Photo Upload Placeholder */}
                        <div style={{ gridRow: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500' }}>Photo</label>
                            <div style={{
                                width: '150px',
                                height: '150px',
                                background: '#F3F4FF',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed #C1BBEB',
                                cursor: 'pointer',
                                color: 'var(--primary-color)'
                            }}>
                                <Upload size={24} />
                                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Upload Photo</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="studentName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                            <input
                                id="studentName"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="studentIdField" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Student ID *</label>
                            <input
                                id="studentIdField"
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                placeholder="#123456"
                                autoComplete="off"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="grade" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Grade *</label>
                            <select
                                id="grade"
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Grade</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="classId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Class *</label>
                            <select
                                id="classId"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="gender" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Gender *</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date of Birth *</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                autoComplete="bday"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="placeOfBirth" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Place of Birth</label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                name="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    {/* Section: Contact Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Contact Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label htmlFor="studentEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                            <input
                                id="studentEmail"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="studentPhone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                            <input
                                id="studentPhone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                autoComplete="tel"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="studentAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address *</label>
                            <textarea
                                id="studentAddress"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows="3"
                                autoComplete="street-address"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Section: Parent Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Parent / Guardian
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Parent Selector */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="parentId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Parent *</label>
                            <select
                                id="parentId"
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleParentSelect}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}
                            >
                                <option value="">-- Choose a parent --</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.parentName} — {p.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-filled read-only fields (shown when parent selected) */}
                        {formData.parentId && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Name</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentName || '—'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Email</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentEmail || '—'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Phone</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentPhone || '—'}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onBack}
                            style={{
                                padding: '0.75rem 2rem',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            {isEditMode ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
